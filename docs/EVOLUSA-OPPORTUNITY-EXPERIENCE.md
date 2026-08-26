# EVOLUSA — Opportunity Experience

Milestone 04C. Turns the verified Opportunity Engine ([EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md](./EVOLUSA-LEAD-OPPORTUNITY-ENGINE.md)) and Lifecycle ([EVOLUSA-OPPORTUNITY-LIFECYCLE.md](./EVOLUSA-OPPORTUNITY-LIFECYCLE.md)) into a real, guided, mobile-first UI for both sides — member and professional. No schema change, no new RPC: every read/write here goes through what 0007/0008 already expose.

## Member surface — `/conexiones`

Reads via `getMyOpportunities()` (`lib/opportunities/persistence.ts`) — a plain RLS-scoped `select * from opportunities where member_id = auth.uid()` (0007's existing `select_own_opportunities` policy), filtered to `ROUTED`/`CONTACTED`/`COMPLETED`/`DECLINED`, joined against the member's own `consent_receipts` rows (also already RLS-readable) to show what they authorized. `CREATED` rows (need submitted, not yet consented) are never shown — nothing to act on yet.

Each opportunity renders as an `OpportunityCard`: category + need labels, an icon+text `OpportunityStatus`, an `ExpirationIndicator` when relevant, a 3-step `OpportunityTimeline` for `ROUTED`/`CONTACTED`/`COMPLETED`, state-specific headline/supporting copy (`data/opportunities/copy.ts`), a `ConsentSummary` of what was shared, and `MemberActions` gated by `getMemberActions(effectiveStatus)`.

## Professional surface — `/panel-profesional/oportunidades`

Gated by `profiles.role === 'PROFESSIONAL'` at the page level (a UX redirect, not the security boundary — see below). Reads via `getMyRoutedOpportunitiesForProfessional()`, a thin mapper over `get_my_routed_opportunities()` (0008) into `ProfessionalOpportunityView`. Renders as `ProfessionalOpportunityCard`: need summary, three fixed, safe match-reason sentences derived only from fields the RPC returns, status, expiration, the actual consented contact fields (`memberName`/`contactEmail`/`city`/`state`, rendered whenever non-null — the RPC's own `CASE` expressions already gate them, so no extra client-side check is needed), a `ConsentSummary` badge list of what was authorized, and `ProfessionalActions` gated by `getProfessionalActions(effectiveStatus)`.

## Actions wired

Three thin server-action wrappers in `app/(account)/actions.ts` — `markContactedAction`, `completeOpportunityAction`, `declineOpportunityAction` — each a one-line call into the existing `lib/opportunities/persistence.ts` functions plus a `revalidatePath`. None of these re-check who is allowed to call them: `mark_opportunity_contacted`, `complete_opportunity`, and `decline_opportunity` (0008) each independently re-verify the caller's exact authority from `auth.uid()`. The UI only ever renders a button for an action `getMemberActions`/`getProfessionalActions` says is available — never a second, independent authorization decision.

Client components receive only primitives (`opportunityId` string, `effectiveStatus`) and bound server-action references (`action.bind(null, opportunityId)`) as props — never the raw opportunity row. This matters concretely for the member side: `getMyOpportunities()`'s row includes `organicMatchScore` (an internal ranking value that must never reach the client, per this milestone's "no internal scoring" rule) — `OpportunityCard` stays a Server Component specifically so that value is never serialized across the client boundary, not just never rendered in JSX.

## Decline UX

`DeclineDialog` (Radix Dialog — an already-installed, previously-unused dependency, chosen over a hand-rolled modal for its built-in focus trap, Escape-to-close, and ARIA wiring) renders an accessible `<fieldset>`/`<legend>` radio group (`components/ui/RadioGroup.tsx`, already existing) scoped to the actor passed in (`MEMBER` or `PROFESSIONAL`) — never a shared list, never a freeform text field, including for `OTHER`.

## Expiration UX

`ExpirationIndicator` renders a static day-count ("Expira en N días" / "Expiró"), computed by the new pure `getExpirationLabel()` (`lib/opportunities/lifecycle.ts`) — only while `status` is raw `ROUTED`, matching that 0008 stops time-boxing an opportunity once `CONTACTED`. Never a client-side ticking countdown; never recomputes or writes `expires_at`.

## Navigation

`AccountShell` now takes a `role` prop (fetched server-side in `app/(account)/layout.tsx` via the new `getCurrentRole()`, `lib/account/persistence.ts`) and shows **either** "Conexiones" **or** "Oportunidades" — never both, since the two surfaces are mutually exclusive per this project's account model. Every other nav item is unchanged. The mobile bottom nav grid widened from 4 to 5 columns to fit the new tab.

## Privacy boundaries

No new personal-data category, no new `auth.users` read, no freeform cross-party field, no messaging system. The professional's read never queries `profiles`/`professional_profiles`/`auth.users` directly — `get_my_routed_opportunities()` remains the only source. `organic_match_score` is never rendered and never crosses into a Client Component (see "Actions wired" above) on either surface — the RPC-based professional read never even receives it, by construction of 0008's return columns.

## Accessibility

Decline reasons are a labelled `radiogroup` (native `<fieldset>`/`<legend>`), never a bare `<select>`. `OpportunityStatus` always pairs an icon with text — status is never color-only. Radix Dialog provides focus trapping, Escape-to-close, and `aria-modal` semantics. All interactive targets meet the existing 44px (`min-h-11`) minimum already used throughout the account area.

## Analytics interface

`lib/opportunities/analytics.ts` defines six typed event names and payload shapes (`opportunity_viewed`, `opportunity_marked_contacted`, `opportunity_completed`, `opportunity_declined`, `opportunity_expired_viewed`, `opportunity_rematch_started`) as a provider-independent contract. **Nothing calls this yet** — no component emits an event, no provider is connected, no event table exists. It exists solely so a future integration has an intentional shape to implement against.

## What remains deferred

- **No "start a new opportunity" UI exists anywhere in this codebase.** `create_qualified_opportunity`/`consent_and_route_opportunity` (0007) have never had a calling UI — they were only ever exercised via direct RPC calls during live testing. "Buscar otra opción" (shown on `DECLINED`/effectively-`EXPIRED` cards) currently links to `/roadmap`, the closest existing real destination — not a dedicated rematch flow, because none exists yet. Building that flow is real, undone work, not a detail of this milestone.
- The member's card never shows the matched professional's name or a link to their public profile. `professional_profiles_public` (the safe public view) deliberately does not expose an `id` column to join back from `matched_professional_profile_id` (see 0005's SECURITY BOUNDARY comment) — resolving this needs a schema decision, which this milestone's constraints (no new migration unless a genuine blocker) correctly ruled out doing incidentally.
- No notifications, no SMTP, no ratings, no chat/messaging, no analytics provider, no rate limiting — all unchanged from 04B's own deferred list.
- Full authenticated browser verification of the new cards was not performed live in this milestone (see `docs/CURRENT-STATE.md`'s 04C section) — verification relied on the 8 new unit tests plus a live, unauthenticated check that both new routes correctly redirect to `/login`, consistent with this milestone's instruction to prefer unit/integration boundaries and avoid creating a live test identity unless required.
