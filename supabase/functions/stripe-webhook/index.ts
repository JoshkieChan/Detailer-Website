import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@10.0.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
  })

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  const body = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.bookingId

    if (bookingId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          deposit_status: 'paid',
          stripe_session_id: session.id
        })
        .eq('id', bookingId)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
})
