# EVOLUSA — Trust & Compliance (Platform Extension)

Extends `data/compliance/claims.ts` and the RLS posture in [EVOLUSA-SECURITY.md](./EVOLUSA-SECURITY.md) for the Professional Network and EvolUSAia. Does not replace either — both remain canonical for what they already cover (marketing claims, existing account tables).

## Compliance engine extension

`data/compliance/claims.ts` already models `ServiceCategory` → `FulfillmentType` → verification requirement → disclaimer, with `isServicePublishable()` as the publishing guard. The Professional Network needs the same shape at the **professional-category** level, not a parallel system:

```ts
// data/professional/categories.ts (new — mirrors ServiceCompliance)
type ProfessionalCategory = {
  id: string;                          // e.g. "immigration_attorney"
  label: string;
  group: "REGULATED" | "SERVICE_BUSINESS";
  mapsToServiceCategory: ServiceCategory | null; // links back to claims.ts's existing categories
  scope: string;
  verificationRequirements: readonly VerificationType[];
  jurisdictionRule: "STATE" | "NATIONAL" | "LOCAL";
  allowedClaims: readonly string[];    // claim ids, same registry as claims.ts
  prohibitedClaims: readonly string[];
  requiredDisclaimerIds: readonly string[];
  adviceIsRegulated: boolean;
  bookingPaymentConstraints: string;   // e.g. "no fee-splitting with non-attorney" for BAR categories
};
```

A regulated professional category (Immigration Attorney, Business/Tax Attorney, CPA, EA, Insurance Professional, DOJ-Accredited Representative) is **disabled from public matching by default** until its verification requirements are satisfied — the same default-off posture `serviceCompliance` already applies to `LEGAL`/`IMMIGRATION`/`TAX`/`INSURANCE`/`NOTARY`/`BOOKKEEPING`/`BUSINESS_FORMATION`. Flipping a category's defaults is a business/legal decision, never an engineering one — this rule already exists in `compliance-reviewer`'s instructions and applies unchanged here.

**LEGAL/IMMIGRATION stays especially strict**: no claim in `allowedClaims` for these categories may imply outcome prediction, eligibility determination, or case strategy — those remain `PROHIBITED` at the claim-registry level, not just convention.

### AI escalation compliance

The escalation engine ([EVOLUSA-EVOLUSAIA.md](./EVOLUSA-EVOLUSAIA.md)) is itself a compliance surface: `LEGAL`/`IMMIGRATION` escalation signals must resolve to `VERIFIED_PROFESSIONAL` or `URGENT_HUMAN_REVIEW`, never `EVOLUSA_GUIDE`, regardless of how confident a model output is. This is enforced by the deterministic rule layer running before any model call, not by prompting the model to "be careful."

## Privacy & security model

User immigration/legal/financial/business data is treated as highly sensitive product data — the same standard already applied to the existing account tables in [EVOLUSA-SECURITY.md](./EVOLUSA-SECURITY.md), extended to the new surfaces.

### RLS patterns needed (new beyond today's single-owner pattern)

Every table added today in this codebase uses one RLS pattern: `user_id = (select auth.uid())`. The Professional Network introduces two more patterns that don't exist yet and need explicit design before any migration is written:

1. **Public-safe view, not public table access.** `professional_profiles`, `verifications`, and `availability` each have fields that must be public (name, category, "Verified" badge, open slots) and fields that must never be public (credential identifiers, evidence metadata, raw pricing negotiation notes, full calendar). Pattern: the base table has **no** public SELECT policy at all (owner + admin only); a `..._public` view, built with `security_invoker = false` (or a security-definer function) and its own explicit column list, is the only thing granted to `anon`/`authenticated`. Never widen a base table's RLS to "make a public profile work" — add a view instead.

   **Live since Milestone 01/03** (`professional_profiles`/`professional_profiles_public`, `professional_verifications`): the base tables grant `anon`/`authenticated` nothing (verified via `information_schema.role_table_grants`/`role_column_grants`, both table- and column-level), and for `professional_verifications` specifically there is no public-safe view at all yet — trust state reaches the public only as one derived boolean (`identity_verified`) computed live inside `professional_profiles_public`, an even stricter variant of this pattern than the dedicated-view design originally sketched here. See [EVOLUSA-PROFESSIONAL-NETWORK.md](./EVOLUSA-PROFESSIONAL-NETWORK.md#v1-status-live--deliberately-minimal-subset-of-the-design-above) for what's live versus still design-only.
2. **Two-party visibility.** `matches`, `appointments`, `appointment_participants`, `appointment_outcomes`: both the member and the professional in the record need to read it, but no one else. Policy shape: `USING (member_id = (select auth.uid()) OR professional_id IN (SELECT id FROM professional_profiles WHERE user_id = (select auth.uid())))`. This is a genuinely new pattern for this codebase and should get its own review pass from `security-reviewer` before any of these tables are migrated — it's easy to accidentally over-widen an OR-based policy.

### Consent and access grants

**No professional gets access to a member's Roadmap, profile, or life events merely because they matched or were booked.** The only data a professional ever sees by default is what the member explicitly typed into that appointment's `intake_notes`. Any broader sharing (e.g., "let this attorney see my full Roadmap") is a future explicit, revocable `data_access_grants` table (Phase 2/3, not MVP) — until that table exists, there is no code path for a professional to read Member data beyond their own appointment's intake notes.

**No silent sharing between professionals.** Professional A can never see professional B's appointments, matches, or reviews with a shared member — every query is scoped by `professional_id = auth.uid()`'s own professional row, never by member.

### Audit logging

A generic `audit_log` table (`actor_user_id`, `action`, `target_table`, `target_id`, `metadata jsonb`, `created_at`) for admin-sensitive actions: verification status changes, moderation decisions, access-grant creation/revocation. Phase 2 — not MVP-blocking, but the table shape should be settled now so verification/moderation work (which starts in MVP) writes into it from day one rather than backfilling later.

### Data retention & deletion

- Per-user data deletion (account closure) must cascade the same way existing tables do (`on delete cascade` from `auth.users`) — every new table follows this without exception.
- `source_registry`/`source_documents` are not personal data and are exempt from user-deletion cascades.
- `reviews` and `appointment_outcomes` reference two parties (member + professional) — deleting one party's account should anonymize rather than hard-delete the other party's record of the interaction (e.g., a professional's review history shouldn't vanish because the reviewing member later deleted their account). This needs an explicit decision before Phase 2 reviews ship — flagged as an open question in [EVOLUSA-MVP-V2.md](./EVOLUSA-MVP-V2.md#biggest-unresolved-risks).
- Document metadata (Phase 2, not MVP) needs its own retention policy once it exists — not designed in this pass since documents aren't in MVP scope.

### Minimal AI context

EvolUSAia's context object (see EvolUSAia doc) is assembled server-side from exactly the fields it needs for the current turn — never the user's entire account row dumped into a prompt. This is a cost and safety property, not just a performance one: the smaller and more explicit the context assembly, the easier it is to audit what the model actually saw for any given response.
