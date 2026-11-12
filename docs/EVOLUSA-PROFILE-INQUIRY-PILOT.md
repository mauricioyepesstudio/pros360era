# EvolUSA — Profile Inquiry M1: Pilot acceptance and release runbook

**Scope:** controlled, authenticated, consent-first inquiry into the **selected** professional's existing ARM/CRM. Only `BUSINESS_MARKETING` and `BUSINESS_OPERATIONS`. All other categories remain outside this pilot. No payments, outreach, social posting or automatic messages.

**Code review:** https://github.com/mauricioyepesstudio/pros360era/pull/130
**Official domain:** https://evolusa.us
**Prepared migration:** `supabase/migrations/20261112183000_crm_profile_inquiry_pilot.sql`

## System boundaries

- No new CRM; existing `crm_leads` records stay owned by the professional's auth user. One record per owner + email.
- The inquiry receipt is stored separately (`crm_profile_inquiries`) so multiple distinct inquiries can reference the same lead.
- Only a verified, authenticated MEMBER can submit. The professional must be approved, accepting, in an eligible category, and on the **database allowlist**.
- Permission to submit is OFF by default in two places:
  1. Vercel server setting `EVOLUSA_INQUIRY_PILOT_ENABLED`, default false;
  2. restricted `crm_inquiry_pilot_settings.enabled` in Postgres, false until a privileged operator changes it.
- The allowlist `crm_inquiry_pilot_profiles` is empty by default and has no normal client read/write privileges.
- Repeat attempts reuse one receipt by request key; accidentally re-created identical requests to the same profile within 15 minutes reuse a receipt even with a new key.
- Only the selected professional's account can read a receipt; no cross-owner RLS, and only the assigned professional can read the associated CRM lead.
- The public intake collects contact information and brief project need only, with destination-specific consent. Do not request case files, IDs, financial records or other sensitive documents.
- New profile-originated leads are excluded from the optional GoHighLevel export, because the intake consent does not authorize sharing with that third party. If an old CRM lead already exists and has an independent GHL connection, this new inquiry adds no details to the existing CRM lead. A separate policy review is required before broadening integrations.
- Existing lead follow-up and manual CRM remain functional if this feature is off.

## Before applying to a database

1. Approve security-definer/RLS review and validate matching schema against a disposable isolated database.
2. Confirm the cost of a Supabase development branch before creating it. PGlite synthetic tests alone do not establish live PostgREST/RLS/auth behavior.
3. Do not use service-role or admin credentials in a browser. Never insert fictional professionals into the live directory.
4. Confirm deletion/retention policy and whether customer requests need email notification with separate consent.
5. Keep the change on a PR/preview until CI and authenticated tests pass.

## Controlled activation (privileged operator only)

After the migration is reviewed/applied to a **test** environment, explicitly allowlist a test marketing/operations profile. The database starts disabled. A privileged administrator may execute the following in the test database with the **real test profile UUID**, never on production without approval:

```sql
insert into public.crm_inquiry_pilot_profiles(professional_profile_id)
values ('REPLACE_WITH_AUTHORIZED_TEST_PROFILE_UUID');

insert into public.crm_inquiry_pilot_settings(id,enabled)
values (1,true)
on conflict (id) do update set enabled=excluded.enabled;
```

Then set `EVOLUSA_INQUIRY_PILOT_ENABLED=true` for the **test environment only**. Do not send real messages or activate GHL sync for test contacts.

### Stop immediately (database kill switch)

```sql
update public.crm_inquiry_pilot_settings set enabled=false where id=1;
```

Disable the Vercel flag as well. Existing records are preserved; the rollback never deletes leads.

## End-to-end acceptance checks

- [ ] Anonymous visitor cannot call RPC or see intake.
- [ ] MEMBER without consent is rejected, even when calling RPC directly.
- [ ] MEMBER submitting to an unlisted/regulated/inactive profile is rejected.
- [ ] Two different MEMBER users cannot read each other's private data.
- [ ] Re-sending the same UUID returns one inquiry receipt.
- [ ] Re-sending identical details with a different UUID within 15 minutes returns the existing receipt.
- [ ] Three distinct inquiries per hour are allowed; fourth is rejected.
- [ ] One owner receives one `crm_leads` entry for the same email, plus the correct inquiry context in the existing CRM.
- [ ] Another professional sees no lead or inquiry details.
- [ ] No email, WhatsApp, social message, GHL contact sync or payment occurs.
- [ ] User can open the real professional profile, find the intake when enabled and review the exact recipient and consent.
- [ ] Disable switch; direct RPC calls now fail even if frontend remains loaded.

## Verified status

- CI lint, typecheck, test and build passed for earlier preview (commit `84f5ebf`).
- Later security and privacy improvements require a new green CI run before approval.
- **Not applied to production. No pilot customer data created. No automated messages sent.**

## Later milestones

Opt-in delivery notifications with provider acknowledgments, consent management, data retention/deletion, richer service/category catalogs, multi-organization ownership, dedicated agent automations and measurable conversion outcomes. These are not present in M1.
