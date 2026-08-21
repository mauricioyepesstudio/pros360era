# EVOLUSA — Product Architecture

## Product principle

One domain model—stages, milestones, offerings, provider types, and roadmap status—should power marketing, qualification, fulfillment, and the future portal. The marketing site is the first interface to that system, not a disposable brochure.

## EVOLUSA Roadmap

**Promise:** “Responde unas preguntas y descubre un camino inicial para tu próxima etapa en Estados Unidos.” It is an orientation/routing tool, not legal, tax, financial, immigration, or insurance advice.

### MVP flow

1. Choose starting intent.
2. Answer 4–8 progressive questions.
3. Deterministic rules identify stage, goals, and dependencies.
4. Results show **Completado**, **Ahora**, and **Próximamente**.
5. Each milestone explains rationale, provider type, and safe action.
6. With consent, save/send, book, or open WhatsApp with stage context.

No account is required initially. Do not collect immigration status, SSNs, tax IDs, health information, or documents in this MVP.

### Core model

```ts
type ProviderType = "direct" | "professional" | "partner" | "education";
type RoadmapStatus = "complete" | "current" | "upcoming" | "not_applicable";

type Stage = {
  id: string;
  slug: string;
  order: number;
  title: string;
  question: string;
  summary: string;
};

type Milestone = {
  id: string;
  stageId: string;
  title: string;
  summary: string;
  providerType: ProviderType;
  disclaimerKey?: string;
  offeringIds: string[];
};

type RoadmapItem = {
  milestoneId: string;
  status: RoadmapStatus;
  reason: string;
  action?: { label: string; href: string };
};
```

Version answers with the rules that generated the result. Later add user, timestamps, evidence, provider/assignee, notes, and audit history.

## Service architecture

| Type | Meaning | Required presentation |
| --- | --- | --- |
| Direct | EVOLUSA performs a permitted, verified scope | Scope, price basis, terms, limits |
| Professional | Licensed professional performs/supervises | Provider/firm, credentials/jurisdiction, relationship |
| Partner | Third party fulfills | Partner identity and required referral disclosure |
| Education | General information | Educational disclaimer; no individualized advice |

Never infer provider type from marketing category. Maintain verified provider/credential records separately.

## Proposed Home component architecture

```text
HomePage
├── SiteHeader (BrandMark, navigation, future language switch, CTA)
├── Hero (message, Roadmap CTA, assisted CTA, trust line)
├── StageSelector (six StageIntentCards + StagePreview)
├── JourneyOverview (six JourneyStages)
├── StageServices (filter/tabs + OfferingCards)
├── RoadmapPreview (progress + items + CTA)
├── HowItWorks (three ProcessSteps)
├── TrustAndTransparency (provider types + disclosures)
├── Proof (verified content only)
├── FAQ
├── FinalCTA
└── SiteFooter (journey, company, legal, contact)
```

Keep sections server-rendered by default. Isolate client code to selectors, questionnaire, accordion, mobile navigation, and analytics. Store copy/taxonomy in typed data. Create semantic link/button primitives: the existing `Button` nested inside `<a>` is invalid interactive markup. Replace repeated hex values with design tokens.

## KEEP

- `app/page.tsx` as server-composed Home entry.
- `app/layout.tsx` metadata boundary and font setup, after content correction.
- `Container` and basic `Section` composition pattern.
- Navy/gold equity and Poppins temporarily, pending testing.
- Lucide icon system.
- Hero imagery temporarily only if rights/relevance are verified.
- `config/brand.ts` as the seed for centralized configuration.

## REFACTOR

- `Navbar.tsx` → responsive `SiteHeader`, accessible mobile menu, semantic links, correct EVOL/USA mark.
- `Button.tsx` → separate/polymorphic link and button with accessible states/tokens.
- `Section.tsx` → spacing/theme variants and labelled headings.
- `Hero.tsx` → new promise, roadmap-first CTA, responsive `next/image`, honest trust line.
- `Services.tsx` → stage-aware offers with provider labels.
- `Process.tsx` → actual three-step “Cómo funciona”; remove duplicate catalog and fix export name.
- `Benefits.tsx` → verifiable trust/transparency.
- `Testimonials.tsx` → verified, consented proof or no section.
- `FAQ.tsx` → real accessible accordion and reviewed answers.
- `CTA.tsx` → functional roadmap/lead actions.
- `Footer.tsx` → journey, legal, privacy, disclosures, verified contact.
- `brand.ts` → separate brand/legal/contact/claims; do not assume domain/email ownership.
- `globals.css` → accessible semantic tokens, focus, motion.

## CREATE

- `components/brand/BrandMark.tsx` supporting provisional treatments.
- `ButtonLink`, `SectionHeading`, `DisclosureBadge`, `Progress`, `Field`, `Accordion`.
- `StageSelector`, `JourneyOverview`, `StageServices`, `RoadmapPreview`, `HowItWorks`, `TrustAndTransparency`.
- `features/roadmap/` for questionnaire, rules, schemas, results, and tests.
- Typed data for stages, milestones, offers, provider types, disclosures, navigation, FAQs.
- Lead capture with schemas, consent, server validation, spam controls, CRM adapter.
- Privacy, terms, accessibility, and professional/referral disclosure pages.
- Consent-aware analytics adapter/event dictionary.
- Tests for rules, validation, navigation, and accessibility-critical behavior.

## REMOVE

- “Multiservices” as primary positioning.
- Unverified “servicios legales”, “planificación fiscal”, or claims that one team provides regulated services.
- “Todo en un solo lugar” when provider identity is obscured.
- Unsupported numbers, `100%`, ratings, testimonials, speed, experience, or expert-team claims.
- Duplicate service grids and emoji service icons.
- Dead “Conocer más” buttons.
- Claims of creating “toda la estructura legal”, guaranteed compliance/protection, or direct insurance unless verified.
- Unverified domain/email from public config.

## Proposed routes

### Marketing MVP

- `/` — Home
- `/camino` — questionnaire
- `/camino/resultado` — transient/tokenized result; no personal data in query strings
- `/etapas` and `/etapas/[stage]`
- `/servicios` and `/servicios/[slug]`
- `/recursos` and `/recursos/[slug]`
- `/nosotros`, `/contacto`, `/agendar`
- `/privacidad`, `/terminos`, `/accesibilidad`, `/divulgaciones`

### Later platform

- `/entrar`, `/crear-cuenta`
- `/portal`, `/portal/camino`, `/portal/documentos`, `/portal/citas`, `/portal/servicios`, `/portal/notificaciones`
- `/profesionales` and `/profesionales/[slug]`
- English localization after reviewing Next.js 16 guidance and SEO needs.

## Repository observations

- Small Next.js 16 App Router project with React 19, TypeScript, Tailwind 4, and no backend.
- `content`, `data`, `hooks`, `lib`, `styles`, and `types` are empty and available for separation.
- `Badge`, `Card`, `Heading`, and `Input` are empty files—not implemented primitives.
- Navbar is the sole explicit client component; most marketing sections can remain server components.
- `Process.tsx` exports `Services` and duplicates the catalog already in `Services.tsx`.
- CTAs are nested controls or buttons without handlers.
- Hero uses raw `<img>`; implementation must follow installed Next.js 16 docs.
- Analytics, CRM, forms, booking, tests, i18n, privacy, and accounts are not implemented.

## Phase 2 implementation reference

The foundation now exists in `data/compliance`, `data/journey`, `data/services`, and `lib/roadmap`. Structural Home components exist but are intentionally not imported into `app/page.tsx`. See `EVOLUSA-DATA-MODEL.md` and `EVOLUSA-ROADMAP-ENGINE.md`.
