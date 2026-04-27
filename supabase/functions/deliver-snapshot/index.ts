import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, ErrorCodes } from '../_shared/errorResponse.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://signaldatasource.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 10 requests per minute per IP
  const identifier = getRateLimitIdentifier(req);
  const rateLimit = checkRateLimit(identifier, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  });

  if (!rateLimit.allowed) {
    return errorResponse(
      'Too many requests. Please try again later.',
      429,
      ErrorCodes.RATE_LIMIT_EXCEEDED
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const snapshotFromEmail = Deno.env.get('SNAPSHOT_FROM_EMAIL');
  const snapshotPdfUrl = Deno.env.get('SNAPSHOT_PDF_URL');

  // Health Check
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Valid email address is required.');
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase project secrets are missing.');
    }

    if (!resendApiKey || !snapshotFromEmail || !snapshotPdfUrl) {
      throw new Error('Snapshot delivery is not configured yet. Please contact us directly.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 1. Record lead to database
    const { data: lead, error: dbError } = await supabase
      .from('snapshot_leads')
      .insert([{ email }])
      .select('id')
      .single();

    if (dbError) {
      throw new Error(`Database Error: ${dbError.message}`);
    }

    // 2. Send email (Resend)
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: snapshotFromEmail,
        to: email,
        subject: 'Life & Money Snapshot PDF',
        html: `
          <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5; color: #0f1720;">
            <p>Here’s your <strong>Life &amp; Money Snapshot</strong> PDF.</p>
            <p><a href="${snapshotPdfUrl}" target="_blank" rel="noopener noreferrer">Download the PDF</a></p>
            <p style="color:#5e6875; font-size: 12px;">If the link doesn’t work, copy/paste this URL: ${snapshotPdfUrl}</p>
          </div>
        `.trim(),
      })
    });

    if (!resendRes.ok) {
      throw new Error('We could not send the Snapshot email. Please try again or contact us directly.');
    }

    return new Response(
      JSON.stringify({ success: true, leadId: lead.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Snapshot delivery failed.';
    return errorResponse(
      message,
      400,
      ErrorCodes.INTERNAL_ERROR
    );
  }
});
