-- Access-only rollback after explicit approval. Preserves tables and all captured data.
begin;
revoke all on public.crm_leads, public.crm_contacts from public, anon, authenticated;
-- Table REVOKE alone does not remove column INSERT grants.
revoke insert(source, source_url, name, email, phone, whatsapp, notes) on public.crm_leads from authenticated;
revoke insert(name, email, phone, whatsapp, company_name, job_title) on public.crm_contacts from authenticated;
commit;
