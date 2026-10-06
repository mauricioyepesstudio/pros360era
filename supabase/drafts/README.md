# Historical CRM drafts — do not apply

These exact three files were moved here without modifying their SQL:

- `0017_crm_leads_contacts_foundation.sql`
- `0018_crm_conversations_multichannel.sql`
- `0019_crm_pipeline_tasks.sql`

They contain invalid PostgreSQL inline `INDEX(...)` syntax, permissive cross-owner relationships, and messaging consent defaults that must not ship. The 0017 version also collides with another authored migration.

On 2026-10-06 the coordinator checked **migration ledger metadata only** in EVOLUSA `ovialqdazxkekvqqgdiu`: 14 entries, none with these CRM names or 0017/0018/0019 versions. `crm_leads` and `crm_contacts` were also absent. No real user rows were read. This authorizes moving unapplied drafts, not changing applied migration history.

The reviewed replacement is only `../migrations/20261006184204_crm_manual_capture_v1.sql`, two independent tables for manual capture. It does not implement conversations, tags, pipeline, tasks, messages or Growth Automation.

**Do not run blanket `supabase db push` or database reset.** Unrelated pending migrations, duplicated numbers and Growth drafts remain in the historical directory. Apply only the exact reviewed replacement after explicit live-schema approval and the preflight in `docs/CRM-MANUAL-CAPTURE-APPLY.md`.
