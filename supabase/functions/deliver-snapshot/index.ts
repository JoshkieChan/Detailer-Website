import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const automationWebhookUrl = Deno.env.get('BOOKING_AUTOMATION_WEBHOOK_URL');

  // Health Check
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      throw new Error('Valid email address is required.');
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase project secrets are missing.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 1. Record lead to database
    const { data: lead, error: dbError } = await supabase
      .from('snapshot_leads')
      .insert([{ email }])
      .select('id')
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      throw new Error(`Database Error: ${dbError.message}`);
    }

    // 2. Trigger Automation Webhook (n8n/Email Delivery)
    if (automationWebhookUrl) {
      await fetch(automationWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_source: 'life_money_snapshot',
          lead_id: lead.id,
          customer_email: email,
          type: 'lead_magnet_delivery',
          pdf_name: 'Life & Money Snapshot',
          message_body: 'Delivering the Life & Money Snapshot PDF 1-pager.'
        })
      }).catch(e => console.warn("Lead magnet automation payload failed:", e.message));
    }

    return new Response(
      JSON.stringify({ success: true, leadId: lead.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('LEAD MAGNET ERROR:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    );
  }
});
