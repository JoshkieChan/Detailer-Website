-- Update test pending payment bookings to paid status
-- This was for testing purposes only
UPDATE bookings
SET payment_status = 'paid'
WHERE payment_status = 'pending_payment';
