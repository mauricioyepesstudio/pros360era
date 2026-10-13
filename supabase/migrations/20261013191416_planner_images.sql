-- Promotional images are intentionally public for social-network fetching.
-- No anon/authenticated object INSERT, UPDATE, DELETE or LIST policies.
-- Only the server's service role writes after authenticated professional ownership checks.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('planner-images', 'planner-images', true, 4194304, array['image/jpeg'])
on conflict (id) do nothing;
