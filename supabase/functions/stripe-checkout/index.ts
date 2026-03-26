import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@10.0.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno"
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v4.14.4/index.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    if (!stripeSecretKey) throw new Error('STRIPE_SECRET_KEY is missing')

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase environment variables are missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // CRM: Upsert Customer
    let customerId = null
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .upsert(
        { full_name: fullName, email: customerEmail, phone: phone },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select('id')
      .single()
      
    if (customerError) {
      console.error('Customer upsert error:', customerError)
    } else {
      customerId = customerData?.id
    }

    const depositAmount = Math.round(packagePrice * 0.2 * 100)
    const bookingId = crypto.randomUUID()

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      return_url: `${req.headers.get('origin')}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${packageName} - 20% Booking Deposit`,
              description: `Vehicle detail reservation for booking #${bookingId}`,
            },
            unit_amount: depositAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail,
      metadata: { bookingId: bookingId },
    })

    // Calendar Integration
    let googleEventId = null
    try {
      const googleCalendarId = Deno.env.get('GOOGLE_CALENDAR_ID')
      const serviceAccountRaw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
      
      if (!googleCalendarId || !serviceAccountRaw) {
        console.warn('Google Calendar Integration Skipped: Missing GOOGLE_CALENDAR_ID or GOOGLE_SERVICE_ACCOUNT_JSON in Supabase secrets.')
      } else {
        let serviceAccount;
        try {
          serviceAccount = JSON.parse(serviceAccountRaw);
          if (!serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error('Service Account JSON is missing required fields (private_key or client_email).');
          }
        } catch (parseErr) {
          throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON. Ensure it is valid raw JSON data: ' + parseErr.message);
        }
        
        const startDate = `${serviceDate}T09:00:00`
        const endDate = `${serviceDate}T15:00:00`
        const timeZone = "America/Los_Angeles"
        
        const eventBody = {
          summary: `Detail – ${packageName} – ${fullName}`,
          location: locationType === 'garage' 
            ? 'Garage Studio - near Erie St, Oak Harbor (exact address sent later)'
            : address,
          description: `Phone: ${phone}\nEmail: ${customerEmail}\nPackage: ${packageName}\nVehicle: ${vehicleInfo}\nService Type: ${locationType === 'garage' ? 'Garage Drop-off' : 'Mobile Service'}\nDeposit: $${(depositAmount/100).toFixed(2)} paid via Stripe\nStripe Session ID: ${session.id}`,
          start: { dateTime: startDate, timeZone },
          end: { dateTime: endDate, timeZone }
        }
        
        googleEventId = await createGoogleCalendarEvent(googleCalendarId, serviceAccount, eventBody)
      }
    } catch (err) {
      console.error("Google Calendar failed, continuing booking:", err)
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
        total_amount: packagePrice,
        deposit_amount: packagePrice * 0.2,
        status: 'pending',
        deposit_status: 'unpaid',
        stripe_session_id: session.id,
        google_calendar_event_id: googleEventId
      }])
      
    if (dbError) {
      console.error('Supabase Insert Error:', dbError)
      throw new Error(`Failed to save booking details to database.`)
    }

    return new Response(
      JSON.stringify({ clientSecret: session.client_secret, depositAmount: depositAmount / 100 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Edge Function Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
