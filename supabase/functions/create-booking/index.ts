import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v4.14.4/index.ts"
import {
  bookingPackages,
  calculateBookingFinancials,
  getHelcimDepositUrl,
  isBookingPackageId,
  isLocationType,
  isVehicleTypeId,
  toHelcimLocationTypeKey,
  toHelcimPackageKey,
  toHelcimVehicleSizeKey,
  vehicleTypeLabels,
} from "./bookingPricing.ts"
import {
  isMembershipIntent,
  maintenancePlanById,
} from "./maintenancePlans.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RECAPTCHA_MIN_SCORE = 0.5
const PREP_INSTRUCTIONS =
  "Please remove valuables, cash, documents, and heavy loose items before your appointment. For mobile appointments, a safe parking spot and access to the vehicle are all we need."



// Helper to create Google Calendar Event
async function createGoogleCalendarEvent(
  calendarId: string, 
  serviceAccount: any, 
  eventDetails: any
) {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 3600
  
  const privateKey = await importPKCS8(serviceAccount.private_key, "RS256")
  
  const jwt = await new SignJWT({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/calendar.events",
    aud: "https://oauth2.googleapis.com/token"
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(privateKey)
    
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  })
  
  const tokenData = await tokenRes.json()
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error("Failed to get Google access token: " + JSON.stringify(tokenData))
  }
  
  const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(eventDetails)
  })
  
  const calData = await calRes.json()
  if (!calRes.ok) throw new Error("Google Calendar API Error: " + JSON.stringify(calData))
    
  return calData.id
}

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

const formatServiceWindow = (serviceTime: string) =>
  serviceTime === 'morning' ? 'Morning (8am - 12pm)' : 'Afternoon (12pm - 4pm)'

const buildAutomationMessages = ({
  fullName,
  customerEmail,
  phone,
  serviceDate,
  serviceTime,
  packageLabel,
  vehicleTypeLabel,
  locationType,
  address,
  subtotal,
  depositAmount,
  taxAmount,
  totalToday,
  membershipIntent,
}: {
  fullName: string
  customerEmail: string
  phone: string
  serviceDate: string
  serviceTime: string
  packageLabel: string
  vehicleTypeLabel: string
  locationType: 'garage' | 'mobile'
  address: string
  subtotal: number
  depositAmount: number
  taxAmount: number
  totalToday: number
  membershipIntent: 'none' | 'quarterly' | 'monthly'
}) => {
  const locationLabel =
    locationType === 'garage' ? 'Garage Studio, Oak Harbor' : `On-Island Mobile at ${address}`

  const commonLines = [
    `Appointment date: ${serviceDate}`,
    `Time window: ${formatServiceWindow(serviceTime)}`,
    `Package: ${packageLabel}`,
    `Vehicle type: ${vehicleTypeLabel}`,
    `Location: ${locationLabel}`,
    `Subtotal: ${formatCurrency(subtotal)}`,
    `Today's deposit (20%): ${formatCurrency(depositAmount)}`,
    `Tax on today's deposit: ${formatCurrency(taxAmount)}`,
    `Today's total due: ${formatCurrency(totalToday)}`,
    '',
    'Prep instructions:',
    PREP_INSTRUCTIONS,
  ]

  const subject =
    membershipIntent === 'none'
      ? `SignalSource booking confirmation for ${serviceDate}`
      : `SignalSource booking + ${maintenancePlanById[membershipIntent].shortName} plan interest`

  const emailLines = [...commonLines]
  const smsLines = [
    `SignalSource booking received for ${serviceDate} (${formatServiceWindow(serviceTime)}).`,
    `${packageLabel} · ${vehicleTypeLabel}`,
    `${locationLabel}`,
    `Deposit today: ${formatCurrency(totalToday)} (${formatCurrency(depositAmount)} deposit + ${formatCurrency(taxAmount)} tax).`,
    'Prep: remove valuables, documents, cash, and heavy loose items before your appointment.',
  ]

  if (membershipIntent !== 'none') {
    const plan = maintenancePlanById[membershipIntent]
    emailLines.push(
      '',
      'Maintenance Plan',
      plan.emailIntro,
      plan.billingDetails,
      `${plan.pricingLine}.`,
      plan.includedSummary,
      'No recurring charges are taken today. Only today’s detail is billed now, and recurring membership payments are set up separately after the first visit.'
    )
    smsLines.push(
      `${plan.emailIntro} ${plan.summaryLine}`,
      plan.includedSummary,
      'No recurring charges are taken today. Membership billing is set up separately after the first visit.'
    )
  }

  return {
    email: {
      to: customerEmail,
      subject,
      text: emailLines.join('\n'),
    },
    sms: {
      to: phone,
      text: smsLines.join('\n'),
    },
  }
}

async function sendAutomationPayload(payload: Record<string, unknown>) {
  const webhookUrl = Deno.env.get('BOOKING_AUTOMATION_WEBHOOK_URL')
  if (!webhookUrl) {
    return
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Automation webhook error: ${res.status} ${text}`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Early validation of project variables
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const errObj = { error: 'INTERNAL CONFIG ERROR: Supabase URL or Service Role Key is missing in the Edge Function environment.' }
    return new Response(JSON.stringify(errObj), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    })
  }

  try {
    const { 
      package: packageFromClient,
      packageId,
      vehicleType,
      locationType,
      mobileFeeApplied,
      membershipIntent,
      notes,
      email: customerEmail,
      fullName,
      phone,
      address,
      date: serviceDate,
      time: serviceTime
    } = await req.json()
    
    // Auth & Init
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const googleCalendarId = Deno.env.get('GOOGLE_CALENDAR_ID')
    const serviceAccountRaw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
    const ownerEmail = Deno.env.get('OWNER_EMAIL') || 'support@signaldatasource.com'

    // 1. Diagnostic Check (Secrets)
    const missing = []
    if (!supabaseUrl) missing.push('SUPABASE_URL')
    if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing Supabase Secrets: ${missing.join(', ')}. Please add them in Project Settings > Edge Functions.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }


    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const normalizedPackage = isBookingPackageId(packageFromClient)
      ? packageFromClient
      : isBookingPackageId(packageId)
        ? packageId
        : null
    const normalizedVehicleType = isVehicleTypeId(vehicleType) ? vehicleType : null
    const normalizedLocationType = isLocationType(locationType) ? locationType : null
    const normalizedMembershipIntent = isMembershipIntent(membershipIntent)
      ? membershipIntent
      : 'none'

    if (!normalizedPackage || !normalizedVehicleType || !normalizedLocationType) {
      return new Response(
        JSON.stringify({ error: 'Package, vehicle type, and location are required to create a booking.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const pricing = calculateBookingFinancials({
      packageId: normalizedPackage,
      vehicleType: normalizedVehicleType,
      locationType: normalizedLocationType,
    })
    const helcimDepositUrl = getHelcimDepositUrl({
      packageId: normalizedPackage,
      vehicleType: normalizedVehicleType,
      locationType: normalizedLocationType,
    })
    const storedPackage = toHelcimPackageKey(normalizedPackage)
    const storedVehicleType = toHelcimVehicleSizeKey(normalizedVehicleType)
    const storedLocationType = toHelcimLocationTypeKey(normalizedLocationType)
    const packageLabel = bookingPackages[normalizedPackage].label
    const vehicleTypeLabel = vehicleTypeLabels[normalizedVehicleType]

    // 2. Diagnostic Check (Database Schema)
    const { error: schemaCheck } = await supabase
      .from('bookings')
      .select('customer_id, google_calendar_event_id, package, vehicle_type, mobile_fee_applied, membership_intent, calculated_price, tax_amount, total_today, remaining_balance, helcim_deposit_url, notes')
      .limit(0)
    if (schemaCheck) {
      console.error('Schema check failed:', schemaCheck)
      return new Response(
        JSON.stringify({ error: `Database Schema Error: The 'bookings' table is missing required columns for membership intent and pricing persistence. Apply the latest bookings migration, then try again. Error: ${schemaCheck.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    const bookingId = crypto.randomUUID()

    // CRM: Upsert Customer
    let customerId = null
    try {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .upsert(
          { full_name: fullName, email: customerEmail, phone: phone },
          { onConflict: 'email', ignoreDuplicates: false }
        )
        .select('id')
        .single()
        
      if (customerError) {
        console.warn('Customer upsert failed (continuing without ID):', customerError.message)
      } else {
        customerId = customerData?.id
      }
    } catch (err: any) {
      console.warn('Customer upsert crashed (continuing):', err.message)
    }

    // Booking record ID placeholder (Helcim integration pending)
    const sessionId = "pending_helcim_" + bookingId

    // Google Calendar Integration
    let googleEventId = null
    try {
      if (!googleCalendarId || !serviceAccountRaw) {
        console.warn('Google Calendar Integration Skipped: Missing secrets.')
      } else {
        const serviceAccount = JSON.parse(serviceAccountRaw);
        const startDate = `${serviceDate}T09:00:00`
        const endDate = `${serviceDate}T15:00:00`
        const timeZone = "America/Los_Angeles"
        
        const financialSummary = [
          `Subtotal:          $${pricing.subtotal.toFixed(2)}`,
          `Deposit (20%):     $${pricing.depositAmount.toFixed(2)}`,
          `Tax:               $${pricing.taxAmount.toFixed(2)}`,
          `---------------------------`,
          `Total Paid Today:  $${pricing.totalToday.toFixed(2)}`,
          `Remaining (due at service): $${pricing.remainingBalance.toFixed(2)}`,
        ].join('\n')

        const serviceMode =
          normalizedLocationType === 'garage' ? 'Garage Studio' : `On-Island Mobile – ${address}`
        const membershipTag =
          normalizedMembershipIntent === 'none'
            ? ''
            : `[MEMBERSHIP – ${maintenancePlanById[normalizedMembershipIntent].shortName}] `
        const membershipNotes =
          normalizedMembershipIntent === 'none'
            ? []
            : [
                `Client selected Maintenance Plan: ${maintenancePlanById[normalizedMembershipIntent].shortName} on booking. Treat as priority member candidate.`,
                '',
              ]

        const eventBody = {
          summary: `${membershipTag}\uD83D\uDE97 ${packageLabel} – ${fullName}`,
          location: normalizedLocationType === 'garage' ? 'Garage Studio, Oak Harbor, WA' : address,
          description: [
            `=== BOOKING DETAILS ===`,
            `Name:    ${fullName}`,
            `Phone:   ${phone}`,
            `Email:   ${customerEmail}`,
            ``,
            ...membershipNotes,
            `=== VEHICLE ===`,
            `Vehicle Type: ${vehicleTypeLabel}`,
            ``,
            `=== SERVICE ===`,
            `Package:  ${packageLabel}`,
            `Mode:     ${serviceMode}`,
            `Date:     ${serviceDate}  |  Time: ${serviceTime}`,
            ``,
            `=== FINANCIALS ===`,
            financialSummary,
            ``,
            `=== NOTES ===`,
            notes || 'None',
          ].join('\n'),
          start: { dateTime: startDate, timeZone },
          end: { dateTime: endDate, timeZone },
          attendees: [
            { email: ownerEmail, displayName: 'SignalSource Owner', responseStatus: 'accepted' }
          ],
        }
        
        googleEventId = await createGoogleCalendarEvent(googleCalendarId, serviceAccount, eventBody)
      }
    } catch (err: any) {
      console.error("Google Calendar failed:", err.message)
    }

    // Insert Booking
    const { error: dbError } = await supabase
      .from('bookings')
      .insert([{
        id: bookingId,
        customer_id: customerId,
        full_name: fullName,
        email: customerEmail,
        phone: phone,
        address: address,
        vehicle_info: vehicleTypeLabel,
        package: storedPackage,
        package_id: normalizedPackage,
        vehicle_type: storedVehicleType,
        service_date: serviceDate,
        service_time: serviceTime,
        location_type: storedLocationType,
        notes: notes || '',
        mobile_fee_applied: Boolean(mobileFeeApplied) || normalizedLocationType === 'mobile',
        membership_intent: normalizedMembershipIntent,
        calculated_price: pricing.subtotal,
        total_amount: pricing.subtotal,
        deposit_amount: pricing.depositAmount,
        tax_amount: pricing.taxAmount,
        total_today: pricing.totalToday,
        remaining_balance: pricing.remainingBalance,
        helcim_deposit_url: helcimDepositUrl,
        status: 'pending',
        deposit_status: 'unpaid',
        stripe_session_id: sessionId,
        google_calendar_event_id: googleEventId
      }])
      
    if (dbError) {
      console.error('Database Insert Error:', dbError)
      return new Response(
        JSON.stringify({ error: `Database Error: ${dbError.message}. This usually means a column is missing from your 'bookings' table. Try running the SQL again.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    try {
      const automationMessages = buildAutomationMessages({
        fullName,
        customerEmail,
        phone,
        serviceDate,
        serviceTime,
        packageLabel,
        vehicleTypeLabel,
        locationType: normalizedLocationType,
        address,
        subtotal: pricing.subtotal,
        depositAmount: pricing.depositAmount,
        taxAmount: pricing.taxAmount,
        totalToday: pricing.totalToday,
        membershipIntent: normalizedMembershipIntent,
      })

      await sendAutomationPayload({
        booking_id: bookingId,
        membership_intent: normalizedMembershipIntent,
        priority_member_candidate: normalizedMembershipIntent !== 'none',
        booking: {
          package: storedPackage,
          package_label: packageLabel,
          vehicle_type: storedVehicleType,
          vehicle_type_label: vehicleTypeLabel,
          location_type: storedLocationType,
          mobile_fee_applied: normalizedLocationType === 'mobile',
          calculated_price: pricing.subtotal,
          deposit_amount: pricing.depositAmount,
          tax_amount: pricing.taxAmount,
          total_today: pricing.totalToday,
          remaining_balance: pricing.remainingBalance,
          helcim_deposit_url: helcimDepositUrl,
          address,
          notes: notes || '',
          service_date: serviceDate,
          service_time: serviceTime,
        },
        email: automationMessages.email,
        sms: automationMessages.sms,
      })
    } catch (err: any) {
      console.error('Automation webhook failed:', err.message)
    }

    return new Response(
      JSON.stringify({
        bookingId,
        calculatedPrice: pricing.subtotal,
        depositAmount: pricing.depositAmount,
        taxAmount: pricing.taxAmount,
        totalToday: pricing.totalToday,
        remainingBalance: pricing.remainingBalance,
        helcimDepositUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('Edge Function Fatal Error:', error.message)
    return new Response(
      JSON.stringify({ error: `Fatal Edge Error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
