# EVOLUSA — Opportunity Lifecycle

Milestone 04B. Live, hardened, and authorization-tested — `supabase/migrations/0008_evolusa_opportunity_lifecycle_v1.sql`. Extends the Milestone 04A Opportunity Engine ([EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md](./EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md)) past `ROUTED` with the four transitions a real connection actually needs: confirmed contact, member-confirmed completion, decline (either party), and effective (never persisted) expiration.

## State machine

```
CREATED → ROUTED → CONTACTED → COMPLETED
                 ↘ DECLINED  ↗
```

`DECLINED` is reachable from `ROUTED` or `CONTACTED`, by either party. `EXPIRED` is never a stored state — see "Expiration" below.

## Transition authority — one actor per transition, no ambiguity

| Transition | Actor | RPC | Enforcement |
| --- | --- | --- | --- |
| `CREATED → ROUTED` | Member (via consent) | `consent_and_route_opportunity` (0007, unchanged except now also sets `expires_at`) | `auth.uid() = opportunities.member_id` |
| `ROUTED → CONTACTED` | **Matched professional only** | `mark_opportunity_contacted(opportunity_id)` | `auth.uid()` resolves to the `professional_profiles.user_id` matching `matched_professional_profile_id` |
| `CONTACTED → COMPLETED` | **Member only** | `complete_opportunity(opportunity_id)` | `auth.uid() = opportunities.member_id` |
| `ROUTED/CONTACTED → DECLINED` | **Either party** | `decline_opportunity(opportunity_id, reason)` | `declined_by` is *derived* from which identity `auth.uid()` matches — never a client-supplied actor label |

**The professional has no completion action, structurally.** No `mark_opportunity_completed` function exists anywhere in this schema — whether help was actually received is the member's own judgment, never something the party being rated self-certifies. The professional can see that the member confirmed completion (`get_my_routed_opportunities()` returns `status`/`completed_at`), but cannot produce that confirmation themselves.

## Expiration — explicit `expires_at`, never a hidden mutation from a read

`expires_at` is set exactly once, at `ROUTED` time, to `routed_at + 7 days`, inside `consent_and_route_opportunity`. It is never recomputed, never extended, and never written to by anything else.

**A read stays a read.** There is no persisted `EXPIRED` status this milestone — `get_my_routed_opportunities()` (and `lib/opportunities/lifecycle.ts#getEffectiveStatus`, its TypeScript mirror for the member's own direct-table view) computes `effective_status = 'EXPIRED'` when `status = 'ROUTED' AND expires_at <= now()`, purely as a display-time derivation. The stored `status` column stays `ROUTED` indefinitely unless a real transition RPC changes it. (The `status` CHECK constraint from 0007 already permits the literal value `'EXPIRED'` for schema completeness/forward-compatibility — this migration doesn't remove that permission, but nothing in this migration or any future one yet writes it. If persisted `EXPIRED` rows are ever required for a real operational reason — e.g., a background job that needs to query "all expired" cheaply without recomputing the condition every time — that is an explicit, separate, later milestone, not an incidental side effect of a read function.)

**Actions respect expiration**: `mark_opportunity_contacted` rejects with `'opportunity has expired'` when `expires_at <= now()`, even though `status` still reads `ROUTED`. `complete_opportunity` has no expiry check — once `CONTACTED` was legitimately reached (which itself already required passing the expiry check), completion isn't time-boxed; the failure mode expiry exists to catch (no one ever responding) provably didn't happen. `decline_opportunity` has no expiry check either — declining a stale opportunity is unnecessary but harmless, so no special-case block was added for it.

**Rematching is not automatic.** A `DECLINED` or effectively-expired opportunity is never silently re-routed. The member starts a *new* `create_qualified_opportunity` call for the same need — already fully supported by the existing 04A architecture, zero new schema required.

## Decline reasons — actor-scoped, no freeform text

```ts
export const declineReasonsByActor = {
  PROFESSIONAL: ["AT_CAPACITY", "OUTSIDE_SCOPE", "UNREACHABLE", "OTHER"],
  MEMBER: ["FOUND_HELP_ELSEWHERE", "NO_LONGER_NEEDED", "NOT_A_FIT", "OTHER"],
} as const;
```

A professional and a member decline for structurally different reasons, so one shared ambiguous enum was rejected — a professional could otherwise pick a member-shaped reason that doesn't describe their own situation. Enforced in **two independent layers** (the established defense-in-depth pattern for every protected field in this project): `decline_opportunity` validates the resolved actor's reason against the correct list before writing anything, and the database's own `opportunities_decline_reason_actor_check` CHECK constraint enforces the same rule unconditionally, even against a hypothetical future code path that bypasses the RPC. No freeform "other explanation" field exists — `OTHER` exists per actor precisely so analytics can still distinguish "professional had some other reason" from "member had some other reason" without ever opening a cross-party text channel.

## Member UX (conceptual copy — final Spanish wording to be refined against real user testing)

- **ROUTED** — *"Encontramos una opción compatible."* / *"Compartiste únicamente la información que autorizaste. Ahora estamos esperando que el profesional inicie el contacto."* Never promises contact will definitely happen.
- **CONTACTED** — *"Tu conexión ya está en marcha."* / *"El profesional indicó que inició el contacto contigo."* Follow-up: *"¿Recibiste la ayuda que necesitabas?"* → **Sí, recibí ayuda** (completes) / **Todavía no** (does *not* create a negative outcome — it's simply not yet an answer, not a decline).
- **COMPLETED** — *"Paso completado."* / *"Tu confirmación ayuda a EVOLUSA a mejorar futuras conexiones."* Returns the member to their Roadmap. No star-rating flow this milestone.
- **DECLINED** — *"Esta conexión no continuará."* / *"Podemos ayudarte a encontrar el siguiente paso."* Never blame-oriented, regardless of which party declined.
- **Effectively expired** — *"Esta conexión necesita un nuevo paso."* / *"No se confirmó contacto dentro del periodo esperado."* CTA: *"Buscar otra opción."* Never implies the professional was at fault.

## Professional UX

One opportunity view, sourced entirely from `get_my_routed_opportunities()`: why it matched (existing `match_reasons`, not yet surfaced in any UI), consented `LeadSummary` fields only, current status, expiration timing where relevant (`expires_at`), and exactly one primary action per state:

- **ROUTED**: `Marcar como contactado` / `Declinar`.
- **CONTACTED**: `Declinar` only — **no** "Marcar como completado" action exists.
- **Terminal** (`COMPLETED`/`DECLINED`): no action; if `COMPLETED`, the professional sees *"El miembro confirmó que recibió ayuda"* as a read-only fact.

## User value per transition

| State | User friction removed | Professional value added | Platform signal created |
| --- | --- | --- | --- |
| `CONTACTED` | Member stops wondering if anything happened | Visible responsiveness signal | `routing_to_contact_time`, `contact_rate` |
| `COMPLETED` | The loop gets a real "done," not indefinite limbo | Demonstrable outcomes over time | `completion_rate` |
| `DECLINED` | False hope avoided; member can move on quickly | A clean, low-stakes way to say no instead of ghosting | `decline_rate`, `decline_reason_distribution` |
| Effective `EXPIRED` | No opportunity silently rots forever, invisible | An implicit accountability signal without a punitive notification system | `effective_expiration_rate` |

## Privacy

No new personal-data disclosure. All four transitions are status/metadata changes on an opportunity already covered by the consent granted at `ROUTED` time — no new `auth.users` read beyond the existing 0007 exception, no new consent category, no notes/freeform-message field of any kind between member and professional in this milestone (explicitly excluded, not merely postponed).

## Security grants (same hardened pattern as 0007, applied proactively this time — no live incident)

Every one of the three new mutation RPCs and the widened `get_my_routed_opportunities()`: `SECURITY DEFINER`, `search_path = ''`, `revoke all ... from public`, **explicit `revoke execute ... from anon`** (not just `from public` — see [EVOLUSA-SECURITY.md](./EVOLUSA-SECURITY.md)'s reusable rule), `grant execute ... to authenticated` only. No new direct client `INSERT`/`UPDATE` grant on `opportunities` — every lifecycle mutation goes through a narrow RPC that re-verifies the caller's exact authority from `auth.uid()`, never a client-supplied identity or actor label.

One real Postgres limitation discovered live while applying this migration: `CREATE OR REPLACE FUNCTION` cannot change a `RETURNS TABLE` function's output row shape (error `42P13`) — `get_my_routed_opportunities()` needed an explicit `DROP FUNCTION` before its `CREATE`, safe because both statements are in the same migration transaction.

## Testing proof (live, throwaway fixtures only — see "Real data safety" below)

**Positive**: full happy path (create → consent → contact → complete, all timestamps populated correctly); professional declines from `ROUTED`; member declines from `CONTACTED`; the matched professional sees the member-confirmed `COMPLETED` state; effective expiration correctly surfaces (`effective_status = 'EXPIRED'`) while the stored `status` stays `ROUTED`.

**Negative**: member cannot mark `CONTACTED`; an unrelated professional cannot mark `CONTACTED`; the matched professional cannot complete (structurally — `complete_opportunity` checks `member_id`, which a professional's `auth.uid()` can never equal); an unrelated member cannot complete; completing from `ROUTED` (never contacted) is rejected; contacting an already-expired `ROUTED` opportunity is rejected; double-`CONTACTED` and double-`COMPLETED` are both rejected; a professional using a member-only decline reason is rejected; a member using a professional-only decline reason is rejected; an unrecognized decline reason is rejected; `anon` cannot execute any of the four RPCs; direct client `UPDATE` on `opportunities` (including the new lifecycle columns) remains denied at the grant layer; cross-professional read isolation holds for the new columns exactly as it did for the original ones.

## Analytics signals unlocked (definitions only — no infrastructure built)

- `routing_to_contact_time` = `contacted_at - routed_at`
- `contact_rate` = reached `CONTACTED`-or-later ÷ reached `ROUTED`-or-later
- `completion_rate` = `COMPLETED` ÷ reached `CONTACTED`-or-later
- `decline_rate` = `DECLINED` ÷ all non-`CREATED`
- `decline_reason_distribution` = group by `decline_reason` where `DECLINED`
- `effective_expiration_rate` = effectively-expired ÷ reached `ROUTED`-or-later (computed the same way `get_my_routed_opportunities()` does, applied over a time range)

All computable directly from `opportunities`' own columns — no `platform_events` table, no new infrastructure, consistent with the "read state+timestamps directly, never duplicate into events" rule established in Milestone 04's architecture docs.

## Real data safety

Daniela Torres was **not used** for any 04B test. All live tests used four throwaway identities (two members, two professionals) created and fully deleted within the session. Pre-test baseline: `professional_profiles = 1`, `professional_verifications = 0`, `opportunities = 0`, `consent_receipts = 0`, `profiles = 2`. Post-cleanup: identical. Daniela's `is_approved`/`is_accepting_clients`/`identity_verified` confirmed unchanged throughout.
