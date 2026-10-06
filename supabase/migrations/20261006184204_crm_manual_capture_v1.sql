-- Reviewed standalone slice. DO NOT run blanket db push: historical CRM drafts in supabase/drafts are invalid.
-- Requires auth.users, auth.uid(), public.profiles(id, role) and trusted operator-assigned roles.
-- Refuse existing table collisions rather than silently accepting unsafe policies/schema.
begin;
create table public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source text not null check (source in ('website','whatsapp','instagram','facebook','email','referral','other')),
  source_url text check (source_url is null or (length(source_url) <= 2048 and source_url ~ '^https?://')),
  name text check (name is null or length(btrim(name)) between 1 and 200),
  email text check (email is null or length(email) between 3 and 254),
  phone text check (phone is null or length(btrim(phone)) between 1 and 50),
  whatsapp text check (whatsapp is null or length(btrim(whatsapp)) between 1 and 50),
  notes text check (notes is null or length(notes) <= 2000),
  status text not null default 'new' check (status in ('new','contacted','qualified','unqualified','converted','lost')),
  qualification_score integer not null default 0 check (qualification_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (name is not null or email is not null or phone is not null or whatsapp is not null)
);
create unique index crm_leads_owner_email_unique on public.crm_leads(user_id, lower(email)) where email is not null;
create index crm_leads_owner_created on public.crm_leads(user_id, created_at desc);
create index crm_leads_owner_status_source on public.crm_leads(user_id, status, source);

create table public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 200),
  email text check (email is null or length(email) between 3 and 254),
  phone text check (phone is null or length(btrim(phone)) between 1 and 50),
  whatsapp text check (whatsapp is null or length(btrim(whatsapp)) between 1 and 50),
  company_name text check (company_name is null or length(company_name) <= 200),
  job_title text check (job_title is null or length(job_title) <= 200),
  contact_type text not null default 'prospect' check (contact_type in ('prospect','client','partner','other')),
  lifecycle_stage text not null default 'lead' check (lifecycle_stage in ('lead','mql','sql','opportunity','customer','closed_lost')),
  opted_in_email boolean not null default false,
  opted_in_whatsapp boolean not null default false,
  opted_in_sms boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index crm_contacts_owner_email_unique on public.crm_contacts(user_id, lower(email)) where email is not null;
create index crm_contacts_owner_created on public.crm_contacts(user_id, created_at desc);

alter table public.crm_leads enable row level security;
alter table public.crm_contacts enable row level security;
revoke all on public.crm_leads, public.crm_contacts from public, anon, authenticated;
grant select on public.crm_leads, public.crm_contacts to authenticated;
-- Default auth.uid() owns rows. No client write grants for owner, status, scores, consent or timestamps.
grant insert(source, source_url, name, email, phone, whatsapp, notes) on public.crm_leads to authenticated;
grant insert(name, email, phone, whatsapp, company_name, job_title) on public.crm_contacts to authenticated;

create policy crm_leads_select_own_professional on public.crm_leads for select to authenticated
using ((select auth.uid()) = user_id and (select exists(select 1 from public.profiles where id = auth.uid() and role in ('PROFESSIONAL','ADMIN'))));
create policy crm_leads_insert_own_professional on public.crm_leads for insert to authenticated
with check ((select auth.uid()) = user_id and (select exists(select 1 from public.profiles where id = auth.uid() and role in ('PROFESSIONAL','ADMIN'))));
create policy crm_contacts_select_own_professional on public.crm_contacts for select to authenticated
using ((select auth.uid()) = user_id and (select exists(select 1 from public.profiles where id = auth.uid() and role in ('PROFESSIONAL','ADMIN'))));
create policy crm_contacts_insert_own_professional on public.crm_contacts for insert to authenticated
with check ((select auth.uid()) = user_id and (select exists(select 1 from public.profiles where id = auth.uid() and role in ('PROFESSIONAL','ADMIN'))));
-- No UPDATE/DELETE/TRUNCATE grants or policies: no corresponding operations exist in this slice.
commit;
