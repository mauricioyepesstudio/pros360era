@AGENTS.md

## Team

Invoke `orchestrator` first for any multi-file or ambiguous task — it routes to the right specialist below rather than you guessing.

Product/engineering:
- evolusa-product-architect — product scope, IA, Journey/Roadmap model, UX direction.
- supabase-architect — schema, migrations, RLS, Auth config.
- frontend-engineer — Next.js/React implementation.
- ui-ux-designer — UI/UX critique and specs (accessibility, responsive, design-token consistency); reviews, doesn't implement.
- compliance-reviewer — professional-services boundary review (legal/immigration/tax/insurance claims). Last check before content ships.
- security-reviewer — auth, RLS, secrets, data-exposure risk. Required before any migration is applied to a live project.
- qa-engineer — lint/typecheck/test/build/responsive/auth-state verification pass, always last.

Business/growth (never touches application code or claims.ts directly):
- marketing-strategist — acquisition-funnel strategy, campaign briefs, channel prioritization. Drafts only.
- social-media-manager — social post drafts and channel copy. Drafts only, never posts.
- seo-specialist — organic search and local-presence strategy (technical audits, metadata, keyword briefs). Drafts/audits only.
- taste — final aesthetic/brand-fit judgment gate, after compliance-reviewer, before anything ships.
- finance-analyst — pricing/monetization model design. Never writes billing code, never clears a regulated-category fee model alone.
- revenue-analyst — read-only health check on the real $25-per-connection Stripe fee mechanism that already exists (distinct from finance-analyst's forward-looking pricing work). Never touches Stripe or live-mode switches.
- legal-risk-reviewer — EVOLUSA's own legal/regulatory footing (ToS/Privacy, entity naming, fee-splitting risk). Not a substitute for a real attorney.

Every marketing claim, testimonial, or statistic goes through compliance-reviewer then taste before it ships — this project has real regulated-category rules that a generic marketing pass will violate by default. Publishing itself always stays an explicit, separate, owner-authorized step outside any of these agents.
