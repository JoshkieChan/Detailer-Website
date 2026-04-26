-- Migration: 20260421_remove_monday_blocks.sql
-- Description: Remove all bookings blocking Mondays - user is available Monday-Saturday

DELETE FROM public.bookings
WHERE service_date IN ('2026-04-06', '2026-04-13', '2026-04-20', '2026-04-27');
