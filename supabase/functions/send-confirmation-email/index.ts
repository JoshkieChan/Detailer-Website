import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
import { errorResponse, ErrorCodes } from '../_shared/errorResponse.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://signaldatasource.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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
    const { record } = payload;
    if (!record || !record.email) {
      return new Response(JSON.stringify({ error: 'No record or email found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Still return 200 so webhook doesn't retry infinitely if invalid data
      });
    }

    // Only send email if payment is confirmed (not pending)
    if (record.payment_status !== 'paid') {
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

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #10b981;">Booking Confirmed!</h2>
        <p>Hi ${record.full_name},</p>
        <p>Thanks for booking your detailing service with SignalSource. We've received your request and your spot is confirmed.</p>
        
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Appointment Details</h3>
          <p><strong>Service:</strong> ${record.package}</p>
          <p><strong>Date:</strong> ${record.service_date}</p>
          <p><strong>Time:</strong> ${record.start_time}</p>
          <p><strong>Location:</strong> ${record.location_type}</p>
          <p><strong>Vehicle:</strong> ${record.vehicle_type}</p>
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
      },
      body: JSON.stringify({
        from: 'SignalSource <onboarding@resend.dev>', // User should change this to their verified domain later
        to: [record.email],
        subject: `Booking Confirmed: ${record.package} on ${record.service_date}`,
        html: emailHtml,
      }),
    });

    const resData = await res.json();

    return errorResponse(
      'Email sent successfully',
      200,
      ErrorCodes.VALIDATION_ERROR
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Email sending failed.';
    return errorResponse(
      message,
      400,
      ErrorCodes.INTERNAL_ERROR
    );
  }
});
