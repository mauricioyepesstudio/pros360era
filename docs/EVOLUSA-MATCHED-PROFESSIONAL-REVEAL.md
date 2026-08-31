# EVOLUSA — Matched Professional Reveal

Milestone 04E implementation handoff. Migration `0010_evolusa_member_opportunity_professional_projection.sql` is authored but not applied.

## Decision

Do not add `professional_profiles.id` to `professional_profiles_public`. Instead, `get_my_opportunity_professionals()` performs the internal opportunity-to-professional join and returns only approved public profile fields for opportunities owned by `auth.uid()`.

This lets a member see who EVOLUSA matched before granting contact-data consent while preserving the original public-view boundary: anonymous visitors still cannot enumerate or correlate internal professional IDs.

## Returned fields

Opportunity ID, public slug, display name, category, headline, state/city, languages, consultation mode, accepting-clients status, and the derived identity-verification boolean.

Never returned: professional profile ID, professional user ID, organic score, private profile fields, verification records/notes, member data, or another member's opportunity.

## Authorization matrix to verify before live apply

| Caller | Expected result |
| --- | --- |
| Anonymous | Execute denied |
| Authenticated member | Only summaries for their own opportunities |
| Different authenticated member | Zero rows for the first member's opportunities |
| Professional | Only rows for opportunities they own as a member; professional role alone grants nothing |
| Member with a now-unapproved matched profile | No summary for that profile |

Apply only to the EVOLUSA project after security review. Then re-run grants/advisors and live cross-user tests with disposable identities, followed by full cleanup verification.
