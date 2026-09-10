@AGENTS.md

## Team

Product/engineering:
- evolusa-product-architect — product scope, IA, Journey/Roadmap model, UX direction.
- compliance-reviewer — professional-services boundary review (legal/immigration/tax/insurance claims). Last check before content ships.
- (frontend-engineer, qa-engineer, security-reviewer, supabase-architect also exist in .claude/agents/)

Marketing/growth (never touches application code or claims.ts directly):
- growth-marketing-strategist — user acquisition and growth strategy, member vs. professional messaging.
- social-content-lead — external social/community content, Spanish-first.
- brand-taste-lead — visual identity and brand-taste review, bilingual UX.
- revenue-analyst — the $25 connection-fee revenue mechanism's health. Read-only, never touches Stripe or live-mode switches.

Every marketing claim, testimonial, or statistic goes through compliance-reviewer before it ships — this project has real regulated-category rules that a generic marketing pass will violate by default.
