import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, ErrorCodes } from '../_shared/errorResponse.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://signaldatasource.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-signature, webhook-timestamp, webhook-id',
};

const base64ToBytes = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

const timingSafeMatch = (expected: string, candidates: string[]) =>
  candidates.some((candidate) => candidate === expected);

const verifyWebhook = async ({
  body,
  verifierToken,
  webhookId,
  webhookTimestamp,
  webhookSignature,
}: {
  body: string;
  verifierToken: string;
  webhookId: string;
  webhookTimestamp: string;
  webhookSignature: string;
}) => {
  const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    base64ToBytes(verifierToken),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signedContent)
  );
  const generated = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const signatures = webhookSignature
    .split(' ')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => (entry.includes(',') ? entry.split(',')[1] : entry));
  return timingSafeMatch(generated, signatures);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting: 50 requests per minute per IP (higher for webhooks)
  const identifier = getRateLimitIdentifier(req);
  const rateLimit = checkRateLimit(identifier, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
  });

  if (!rateLimit.allowed) {
    return errorResponse(
      'Too many requests. Please try again later.',
      429,
      ErrorCodes.RATE_LIMIT_EXCEEDED
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const verifierToken = Deno.env.get('HELCIM_VERIFIER_TOKEN');
    if (!supabaseUrl || !supabaseServiceRoleKey || !verifierToken) {
      throw new Error('Webhook secrets are missing.');
    }

    const rawBody = await req.text();
    const webhookId = req.headers.get('webhook-id') || '';
    const webhookTimestamp = req.headers.get('webhook-timestamp') || '';
    const webhookSignature = req.headers.get('webhook-signature') || '';

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      return new Response(JSON.stringify({ error: 'Missing webhook headers.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const isValid = await verifyWebhook({
      body: rawBody,
      verifierToken,
      webhookId,
      webhookTimestamp,
      webhookSignature,
    });

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid webhook signature.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const payload = JSON.parse(rawBody);
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { error } = await supabase.from('payment_events').insert([
      {
        helcim_transaction_id: payload.id || payload.transactionId || null,
        event_type: payload.type || 'unknown',
        raw_payload: payload,
      },
    ]);

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook logging failed.';
    return errorResponse(
      message,
      400,
      ErrorCodes.INTERNAL_ERROR
    );
  }
});
