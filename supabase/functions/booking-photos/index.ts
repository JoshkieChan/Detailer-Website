import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { errorResponse, bookingErrorResponse, BookingError } from '../_shared/errorResponse.ts';
import { checkRateLimit, getRateLimitIdentifier } from '../_shared/rateLimiter.ts';
const headers = { 'Access-Control-Allow-Origin': 'https://signaldatasource.com', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-owner-passcode', 'Content-Type': 'application/json' };
const bucket = 'booking-photos';
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return errorResponse('Method not allowed.', 405);
  if (!(await checkRateLimit(getRateLimitIdentifier(req), { windowMs: 60_000, maxRequests: 20 })).allowed) return errorResponse('Too many requests.', 429);
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    if (req.headers.get('content-type')?.includes('application/json')) {
      const expected = Deno.env.get('OWNER_PASSCODE');
      if (!expected || req.headers.get('x-owner-passcode') !== expected) return errorResponse('Owner access required.', 401);
      const { bookingId } = await req.json();
      const { data, error } = await supabase.from('booking_photos').select('path').eq('booking_id', bookingId);
      if (error) throw error;
      if (!data?.length) return new Response(JSON.stringify({ urls: [] }), { headers });
      const { data: links, error: signingError } = await supabase.storage.from(bucket).createSignedUrls((data || []).map(row => row.path), 300);
      if (signingError) throw signingError;
      return new Response(JSON.stringify({ urls: links?.map(link => link.signedUrl) || [] }), { headers });
    }
    const form = await req.formData();
    const bookingId = String(form.get('bookingId') || '');
    const token = String(form.get('token') || '');
    const slot = form.has('slot') ? Number(form.get('slot')) : -1;
    const file = form.get('photo');
    if (!(file instanceof File) || !Number.isInteger(slot) || slot < 0 || slot > 4 || file.size > 5 * 1024 * 1024) throw new BookingError('Use at most five photos, each 5 MB or smaller.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'image/jpeg'
      : bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10' ? 'image/png'
      : new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP' ? 'image/webp' : '';
    if (!type || file.type !== type) throw new BookingError('Only JPEG, PNG, and WebP photos are supported.');
    const { data: booking, error } = await supabase.from('bookings').select('id, hold_expires_at, payment_status').eq('id', bookingId).eq('confirmation_token', token).single();
    if (error || !booking || booking.payment_status !== 'pending_payment' || new Date(booking.hold_expires_at).getTime() <= Date.now()) return errorResponse('Booking upload access expired.', 403);
    const path = bookingId + '/' + slot;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, bytes, { contentType: type, upsert: true });
    if (uploadError) throw uploadError;
    const { error: metadataError } = await supabase.from('booking_photos').upsert({ booking_id: bookingId, slot, path, content_type: type });
    if (metadataError) throw metadataError;
    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch (error) { return bookingErrorResponse(error); }
});
