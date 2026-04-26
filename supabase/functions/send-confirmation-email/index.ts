import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Webhook payload:', payload);

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
      console.log('Skipping email - payment not confirmed:', record.payment_status);
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: 'Payment not confirmed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not set' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
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
    console.log('Resend response:', resData);

    return new Response(JSON.stringify({ ok: true, resendId: resData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error sending email:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
