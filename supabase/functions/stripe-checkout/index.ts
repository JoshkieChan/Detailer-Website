import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@11.18.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v4.14.4/index.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RECAPTCHA_MIN_SCORE = 0.5

async function verifyRecaptchaToken(recaptchaToken: string) {
  const recaptchaSecretKey = Deno.env.get('RECAPTCHA_SECRET_KEY')

  if (!recaptchaSecretKey) {
    throw new Error('Missing Edge Function secret: RECAPTCHA_SECRET_KEY')
  }

  const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: recaptchaSecretKey,
      response: recaptchaToken,
    }),
  })

  const verifyData = await verifyResponse.json()

  if (
    !verifyResponse.ok ||
    verifyData.success !== true ||
    typeof verifyData.score !== 'number' ||
    verifyData.score < RECAPTCHA_MIN_SCORE ||
    verifyData.action !== 'booking'
  ) {
    console.warn('reCAPTCHA verification failed:', verifyData)
    return false
  }

  return true
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      packageId, 
      packageName, 
      packagePrice, 
      estimatedTotal,
      selectedAddOns,
      maintenancePlanId,
      notes,
      vehicleColor,
      recaptchaToken,
      customerEmail, 
      fullName,
      phone,
      address,
      vehicleInfo,
      locationType,
      serviceDate,
      serviceTime
    } = await req.json()
    
    // Auth & Init
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const googleCalendarId = Deno.env.get('GOOGLE_CALENDAR_ID')
    const serviceAccountRaw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')

    // 1. Diagnostic Check (Secrets)
    const missing = []
    if (!stripeSecretKey) missing.push('STRIPE_SECRET_KEY')
    if (!supabaseUrl) missing.push('SUPABASE_URL')
    if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing Supabase Secrets: ${missing.join(', ')}. Please add them in Project Settings > Edge Functions.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (!recaptchaToken || typeof recaptchaToken !== 'string') {
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA verification failed. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const recaptchaPassed = await verifyRecaptchaToken(recaptchaToken)
    if (!recaptchaPassed) {
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA verification failed. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 2. Diagnostic Check (Database Schema)
    const { error: schemaCheck } = await supabase.from('bookings').select('customer_id, google_calendar_event_id').limit(0)
    if (schemaCheck) {
      console.error('Schema check failed:', schemaCheck)
      return new Response(
        JSON.stringify({ error: `Database Schema Error: The 'bookings' table is missing required columns. Please run the Safe SQL migration again. Error: ${schemaCheck.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Normalize inputs
    const numericPrice = typeof (estimatedTotal ?? packagePrice) === 'string'
      ? parseFloat(estimatedTotal ?? packagePrice)
      : (estimatedTotal ?? packagePrice)
    const depositAmount = Math.round(numericPrice * 0.2 * 100)
    const bookingId = crypto.randomUUID()
    const requestOrigin = req.headers.get('origin') || 'https://signaldatasource.com'
    const addOnList = Array.isArray(selectedAddOns) ? selectedAddOns.filter((value) => typeof value === 'string') : []

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
    } catch (err) {
      console.warn('Customer upsert crashed (continuing):', err.message)
    }

    // Create Stripe Session (Redirect Mode)
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${packageName} - Deposit`,
                description: `20% deposit for booking #${bookingId}`,
              },
              unit_amount: depositAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${requestOrigin}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${requestOrigin}/booking?package=${packageId}`,
        customer_email: customerEmail,
        metadata: { 
          bookingId, 
          packageId, 
          customerName: fullName,
          addOns: addOnList.join(' | ').slice(0, 500),
          maintenancePlanId: maintenancePlanId ?? '',
        },
      })
    } catch (stripeErr) {
      return new Response(
        JSON.stringify({ error: `Stripe API Error: ${stripeErr.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

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
        
        const eventBody = {
          summary: `Detail – ${packageName} – ${fullName}`,
          location: locationType === 'garage' ? 'Garage Studio' : address,
          description: `Phone: ${phone}\nEmail: ${customerEmail}\nVehicle: ${vehicleInfo}${vehicleColor ? ` (${vehicleColor})` : ''}\nAdd-ons: ${addOnList.length ? addOnList.join(', ') : 'None'}\nMaintenance Plan: ${maintenancePlanId ?? 'none'}\nNotes: ${notes || 'None'}\nDeposit: $${(depositAmount/100).toFixed(2)}\nStripe: ${session.id}`,
          start: { dateTime: startDate, timeZone },
          end: { dateTime: endDate, timeZone }
        }
        
        googleEventId = await createGoogleCalendarEvent(googleCalendarId, serviceAccount, eventBody)
      }
    } catch (err) {
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
        vehicle_info: vehicleInfo,
        package_id: packageId,
        service_date: serviceDate,
        service_time: serviceTime,
        location_type: locationType,
        total_amount: numericPrice,
        deposit_amount: numericPrice * 0.2,
        status: 'pending',
        deposit_status: 'unpaid',
        stripe_session_id: session.id,
        google_calendar_event_id: googleEventId
      }])
      
    if (dbError) {
      console.error('Database Insert Error:', dbError)
      return new Response(
        JSON.stringify({ error: `Database Error: ${dbError.message}. This usually means a column is missing from your 'bookings' table. Try running the SQL again.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ url: session.url, depositAmount: depositAmount / 100 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Edge Function Fatal Error:', error.message)
    return new Response(
      JSON.stringify({ error: `Fatal Edge Error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
