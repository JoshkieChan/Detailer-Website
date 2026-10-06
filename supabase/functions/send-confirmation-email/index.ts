import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, ErrorCodes } from '../_shared/errorResponse.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://signaldatasource.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const secret = Deno.env.get('CONFIRMATION_WEBHOOK_SECRET');
  if (!secret || req.headers.get('x-webhook-secret') !== secret) {
    return errorResponse('Unauthorized.', 401, ErrorCodes.UNAUTHORIZED);
  }
  if (req.method !== 'POST') return errorResponse('Method not allowed.', 405);

  // Rate limiting: 30 requests per minute per IP
  const identifier = getRateLimitIdentifier(req);
  const rateLimit = checkRateLimit(identifier, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  });

  if (!rateLimit.allowed) {
    return errorResponse(
      'Too many requests. Please try again later.',
      429,
      ErrorCodes.RATE_LIMIT_EXCEEDED
    );
  }

  try {
    const payload = await req.json();

    // Payload structure for Supabase Webhook: { type: 'INSERT', table: 'bookings', record: { ... } }
    const { data: record, error: lookupError } = await createClient(
      Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    ).from('bookings').select('id, email, full_name, package, service_date, start_time, location_type, vehicle_type, payment_status, test_mode, status').eq('id', payload.record?.id).single();
    if (lookupError) throw lookupError;
    if (!record || !record.email) {
      return new Response(JSON.stringify({ error: 'No record or email found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Still return 200 so webhook doesn't retry infinitely if invalid data
      });
    }

    // Only send email if payment is confirmed (not pending)
    if (record.payment_status !== 'paid' || record.test_mode || record.status === 'cancelled') {
      return errorResponse(
        'Payment not confirmed',
        200,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (!RESEND_API_KEY) {
      return errorResponse(
        'Email service not configured',
        500,
        ErrorCodes.INTERNAL_ERROR
      );
    }

    const safe = Object.fromEntries(Object.entries(record).map(([key, value]) => [key, escapeHtml(value)]));
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #10b981;">Booking Confirmed!</h2>
        <p>Hi ${safe.full_name},</p>
        <p>Thanks for booking your detailing service with SignalSource. We've received your request and your spot is confirmed.</p>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Appointment Details</h3>
          <p><strong>Service:</strong> ${safe.package}</p>
          <p><strong>Date:</strong> ${safe.service_date}</p>
          <p><strong>Time:</strong> ${safe.start_time}</p>
          <p><strong>Location:</strong> ${safe.location_type}</p>
          <p><strong>Vehicle:</strong> ${safe.vehicle_type}</p>
        </div>

        <p>If you have any questions or need to reschedule, please reply to this email or text us.</p>
        
        <p>See you soon,<br/>The SignalSource Team</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280;">
          SignalSource – Systems-Driven Car Care | Oak Harbor, WA
        </p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Idempotency-Key': 'booking-confirmation/' + record.id,
      },
      body: JSON.stringify({
        from: Deno.env.get('CONFIRMATION_FROM_EMAIL') || 'SignalSource <onboarding@resend.dev>',
        to: [record.email],
        subject: `Booking Confirmed: ${record.package} on ${record.service_date}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) throw new Error('Email provider rejected the request.');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(
      'Email delivery failed.',
      500,
      ErrorCodes.INTERNAL_ERROR
    );
  }
});
