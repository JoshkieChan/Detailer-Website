-- Supabase only; core PostgreSQL tests do not emulate Storage.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values('booking-photos','booking-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
-- No anonymous policies are added. All uploads/read URLs go through the
-- booking-photos Edge Function with booking capability or owner verification.
