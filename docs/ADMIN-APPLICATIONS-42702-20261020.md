# Admin applications list — 20 October 2026

Trigger: ADMIN dashboard reported 3 pending applications while the list displayed 0.

Live reproduction: admin_list_professional_applications() raised SQLSTATE42702 because its RETURNS TABLE output variable id conflicted with unqualified profiles.id in the ADMIN guard. The TypeScript loader discards RPC errors and rendered the failure as an empty list.

Fix: CREATE OR REPLACE the existing function, qualifying only the existing ADMIN guard with profiles alias p. Signature, selected fields, sorting, owner, SECURITY DEFINER, empty search_path and ACL preserved. No table rows, roles, approvals, credentials or grants changed.

Rollout: function replacement applied directly to the existing EvolUSA database. Versioned idempotent migration generated using Supabase CLI2.109.1 migration new. No application deployment required for this database-only correction; source integration is separate.

Validation:
- ADMIN read-only transaction: 4 total applications, 3 PENDING, one application matching the owner's professional-account email.
- Authenticated non-ADMIN rejected with not authorized.
- Missing identity rejected with not authorized.
- anon actual EXECUTE denied; privilege inspection false.
- Owner postgres, SECURITY DEFINER, empty search_path and existing ACL unchanged.
- Independent security review GO before rollout.
- Real ADMIN browser refresh still requires user confirmation. Screenshot before fix proves ADMIN session and count/list disagreement.
- No TypeScript, dependencies or application UI changed; no app build needed for this SQL-only fix.

Repeatable read-only regression: supabase/tests/admin_applications_guard_regression.sql.

Follow-up: the frontend should represent RPC failures as an error instead of an empty list. Existing application-review statuses REVIEWED/CONTACTED are distinct from professional-profile approval; this fix does not approve anyone.

Rollback: restore the previous function body (same signature/security/ACL) from migration0016 if operationally necessary; doing so restores the known42702 error. Do not drop/recreate the function or broaden grants.
