-- Prepared CRM follow-up; requires explicit owner exception to permission freeze. No new tables, deletion or cross-owner access.
begin;
grant update(status, notes) on public.crm_leads to authenticated;
create policy crm_leads_update_own_professional on public.crm_leads for update to authenticated
using ((select auth.uid()) = user_id and (select exists(select 1 from public.profiles where id = auth.uid() and role in ('PROFESSIONAL','ADMIN'))))
with check ((select auth.uid()) = user_id and (select exists(select 1 from public.profiles where id = auth.uid() and role in ('PROFESSIONAL','ADMIN'))));
create function public.crm_lead_followup_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$;
revoke all on function public.crm_lead_followup_updated_at() from public, anon, authenticated;
create trigger crm_lead_followup_updated_at before update on public.crm_leads
for each row execute function public.crm_lead_followup_updated_at();
commit;
