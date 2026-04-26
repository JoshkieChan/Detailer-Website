-- Migration: clean_test_data.sql
-- Description: Remove test bookings and availability blocks that are causing false red dots on future Mondays and weekdays

-- Delete test bookings: assuming test data has dummy names or notes
DELETE FROM public.bookings
WHERE payment_status != 'paid'
  AND (
    full_name ILIKE '%test%'
    OR full_name ILIKE '%dummy%'
    OR full_name ILIKE '%fake%'
    OR notes ILIKE '%test%'
    OR notes ILIKE '%dummy%'
    OR booking_source = 'test'
  );

-- Also remove obviously fake future bookings for upcoming weekdays only when the text is generic
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

-- Delete test availability blocks
DELETE FROM public.availability_blocks
WHERE 
  reason ILIKE '%test%' 
  OR reason ILIKE '%dummy%'
  OR reason ILIKE '%fake%'
  OR source = 'test';