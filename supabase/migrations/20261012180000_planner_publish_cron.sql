-- Calls the planner publisher every 10 minutes from Supabase, so posts marked
-- "Listo para publicar" go out on time. GitHub's scheduled workflow is kept only
-- as a manual button: its schedule is best-effort and did not fire reliably.
--
-- BEFORE running this file, the owner stores the same CRON_SECRET that is in
-- Vercel in the Supabase Vault (Dashboard > Project Settings > Vault, or SQL):
--   select vault.create_secret('<CRON_SECRET value>', 'planner_cron_secret');
-- The secret is never written in this file or in the repo.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Re-running this file replaces the job instead of duplicating it.
select cron.unschedule(jobid) from cron.job where jobname = 'publicar-planner';

select cron.schedule(
  'publicar-planner',
  '*/10 * * * *',
  $$
  select net.http_get(
    url := 'https://evolusa.vercel.app/api/social/planner/publish',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'planner_cron_secret')
    ),
    timeout_milliseconds := 60000
  );
  $$
);

-- Check it is running (after 10 minutes):
--   select status_code, content from net._http_response order by created desc limit 3;
-- Turn it off:
--   select cron.unschedule('publicar-planner');
