-- Migration: 20260420_clean_incomplete_bookings.sql
-- Description: Remove bookings with missing or NULL start_time/end_time that cause calendar blocking without showing actual times.

DELETE FROM public.bookings
WHERE (start_time IS NULL OR end_time IS NULL OR blocked_until IS NULL)
  AND payment_status != 'paid';
