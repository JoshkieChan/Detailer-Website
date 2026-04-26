-- Migration: clean_test_data_precise.sql
-- Description: Remove clearly fake future bookings and blackout blocks that can create bogus public unavailable dates.

DELETE FROM public.bookings
WHERE payment_status != 'paid'
  AND (
    full_name ILIKE '%test%'
    OR full_name ILIKE '%dummy%'
    OR full_name ILIKE '%fake%'
    OR notes ILIKE '%test%'
    OR notes ILIKE '%dummy%'
    OR notes ILIKE '%fake%'
    OR booking_source = 'test'
  );

DELETE FROM public.bookings
WHERE payment_status != 'paid'
  AND service_date > CURRENT_DATE
  AND service_date <= CURRENT_DATE + INTERVAL '90 days'
  AND (
    full_name IS NULL OR full_name = ''
    OR notes ILIKE '%test%'
    OR notes ILIKE '%dummy%'
    OR notes ILIKE '%fake%'
    OR booking_source = 'test'
  );

DELETE FROM public.availability_blocks
WHERE reason ILIKE '%test%'
  OR reason ILIKE '%dummy%'
  OR reason ILIKE '%fake%'
  OR source = 'test';
