import { expect, test } from 'vitest';
import { validateBooking } from '../../../supabase/functions/_shared/bookingValidation';
import { bookingErrorResponse } from '../../../supabase/functions/_shared/errorResponse';
import { verifyWebhook } from '../../../supabase/functions/_shared/webhookVerification';
const now = new Date('2030-06-01T12:00:00Z');
const valid = { fullName: 'Jane Detail', email: 'jane@example.com', phone: '3605551234', address: 'Test address', packageId: 'maintenance', vehicleType: 'sedan', locationType: 'garage', service_date: '2030-06-10', start_time: '08:00' };
test.each([
  { packageId: 'invalid' }, { vehicleType: 'invalid' }, { locationType: 'invalid' },
  { selectedAddOns: ['fake'] }, { selectedAddOns: ['engineBay', 'engineBay'] },
  { selectedAddOns: 'engineBay' }, { total_today: 0 }, { payment_status: 'paid' },
  { helcim_deposit_url: 'https://attacker.example' }, { buffer_minutes: 0 },
  { service_date: '2030-06-09' }, { service_date: '2030-02-30' }, { start_time: '08:30' },
  { service_date: '2020-06-10' }, { email: 'invalid' },
])('rejects invalid or forged booking fields: %j', change => {
  expect(() => validateBooking({ ...valid, ...change }, now)).toThrow();
});
test('derives prices, times, status and add-ons from the validated selection', () => {
  const { record, window } = validateBooking({ ...valid, selectedAddOns: ['engineBay'] }, now);
  expect(record).toMatchObject({ payment_status: 'pending_payment', booking_source: 'web', test_mode: false, deposit_amount: 45, addons_price: 60, remaining_balance: 240, end_time: '11:30' });
  expect(window.segments).toHaveLength(1);
});
test('database conflicts return a CORS-readable structured 409 without internal details', async () => {
  const response = bookingErrorResponse({ code: '23P01', message: 'private DB details' });
  expect(response.status).toBe(409);
  expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
  expect(await response.json()).toMatchObject({ code: 'SLOT_UNAVAILABLE' });
});
test('webhook rejects modified bodies and stale signed events', async () => {
  const token = btoa('test-only-signing-key-32-bytes-long');
  const timestamp = String(Math.floor(now.getTime() / 1000));
  const body = '{"id":"test"}';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(atob(token)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('event.' + timestamp + '.' + body)))));
  const args = { body, verifierToken: token, webhookId: 'event', webhookTimestamp: timestamp, webhookSignature: 'v1,' + signature, now: now.getTime() };
  expect(await verifyWebhook(args)).toBe(true);
  expect(await verifyWebhook({ ...args, body: '{}' })).toBe(false);
  expect(await verifyWebhook({ ...args, now: now.getTime() + 301_000 })).toBe(false);
});
