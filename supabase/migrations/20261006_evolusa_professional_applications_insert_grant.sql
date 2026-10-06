-- 20261006 — Restore the public INSERT grant on professional_applications
--
-- Drift found 2026-10-06 (read-only check of ovialqdazxkekvqqgdiu): the
-- table and its "anyone_can_apply" INSERT policy exist live, but the table
-- ACL only lists postgres and service_role. The column-level grant from
-- 0014 is missing, so every anon/authenticated insert fails with
-- "permission denied" and /aplicar-profesional could not take applications.
--
-- This re-applies exactly the grant 0014 already defined (same columns:
-- status, reviewed_by and reviewed_at stay server-only) and adds one
-- partial unique index so a double submit or a retry does not create a
-- second pending row for the same email and category. Idempotent: safe to
-- run more than once. Requires owner OK before running on the live project.

revoke all on public.professional_applications from anon, authenticated;
grant insert (full_name, email, phone, city, category_of_interest, credential_info, bio, notes)
  on public.professional_applications to anon, authenticated;

create unique index if not exists professional_applications_pending_email_category_key
  on public.professional_applications (lower(btrim(email)), category_of_interest)
  where status = 'PENDING';

-- Verification (run after applying; expected: false, true, false, false --
-- the grant is column-level, so the table-level INSERT check stays false):
--   select has_table_privilege('anon', 'public.professional_applications', 'INSERT'),
--          has_column_privilege('anon', 'public.professional_applications', 'email', 'INSERT'),
--          has_column_privilege('anon', 'public.professional_applications', 'status', 'INSERT'),
--          has_table_privilege('anon', 'public.professional_applications', 'SELECT');
