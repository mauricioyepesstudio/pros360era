begin;
revoke update(status, notes) on public.crm_leads from authenticated;
drop policy if exists crm_leads_update_own_professional on public.crm_leads;
drop trigger if exists crm_lead_followup_updated_at on public.crm_leads;
drop function if exists public.crm_lead_followup_updated_at();
commit;
