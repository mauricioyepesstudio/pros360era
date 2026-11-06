# ARM implementation checkpoint — 2026-10-29

Worktree: C:/AI-OPS/worktrees/evolusa-professional-flow-20261028
Branch: codex/evolusa-professional-flow-20261028
No commit, push, deployment or production migration.

Implemented:
- Existing POST /api/crm/leads/[id] authenticates via getCRMAccess and reads lead with session owner filter.
- Own professional profile and private business intake are loaded on server; missing context blocks action.
- Deterministic first response/next step uses saved lead state and permitted business services. Regulated categories get administrative scope only.
- Context hash + lead ID + state form stable dedup key. Saved notes explicitly identify draft/not sent; optimistic updated_at prevents overwrite. Readback validates lead/owner/notes.
- Existing CRM lead detail offers Prepare ARM follow-up, preserving unsaved edits and displaying no automatic WhatsApp connection.
- No new CRM, table, live webhook, external message, model call or payment.

Changed in this slice: lib/crm/arm.ts; app/api/crm/leads/[id]/route.ts; components/crm/LeadFollowup.tsx; tests/crm-arm.test.ts; tests/crm-arm-handler.test.ts.
Pre-existing WhatsApp/profile/panel changes preserved.

Validation: npm test 340/340 PASS (333 prior + 7 ARM); tsc PASS; focused ESLint PASS; Next build PASS (85 pages); git diff --check PASS.
A final href-only correction points Configure business to existing /panel-profesional/perfil instead of a nonexistent route.
Handler tests execute transpiled actual route with mocked access/DB. Real authenticated browser and live database save not verified. Preview server fallback is not evidence of authenticated data.
Logs: arm-tests-20261029.log and arm-build-20261029.log (local only).

Next action: verify authenticated professional CRM detail save/reload with a disposable technical record, then wire WhatsApp Cloud onboarding, tenant-specific credentials mapping, signature-verified webhook and message consent before any automatic messaging.
