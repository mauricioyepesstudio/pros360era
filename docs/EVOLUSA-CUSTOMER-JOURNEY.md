# EVOLUSA — Customer Journey

## Journey model

The Journey is a non-linear six-stage framework. Users may enter anywhere, revisit foundations, or pursue several tracks.

**Llega → Establécete → Emprende → Protégete → Crece → Evoluciona**

Stage names describe customer goals, not EVOLUSA's professional authority.

## Entry: “¿En qué etapa estás?”

| Choice | Initial routing | Immediate outcome |
| --- | --- | --- |
| Acabo de llegar | Llega | Orientation and resource path |
| Necesito organizarme | Establécete | Foundation checklist |
| Quiero crear una empresa | Emprende | Business-readiness questions |
| Ya tengo un negocio | Protégete/Crece diagnostic | Identify operating or growth priority |
| Necesito protegerlo | Protégete | Risk/compliance triage with disclosure |
| Quiero conseguir más clientes | Crece | Presence/acquisition diagnostic |

Selection should show a relevant preview, then offer **Ver mis próximos pasos** and **Hablar con alguien**.

## 01 — Llega

**Question:** “¿Por dónde empiezo?”  
**Outcome:** understand immediate priorities and trustworthy resource categories.  
**Milestones:** define goals, location, preferred language/contact, resource needs, first-step plan.  
**Offers:** educational orientation, resource directory, needs assessment, verified referrals.  
**Guardrail:** legal/immigration questions go to an appropriately licensed attorney or authorized organization. Do not interpret status, eligibility, forms, deadlines, or options.

## 02 — Establécete

**Question:** “¿Cómo organizo mi nueva etapa?”  
**Outcome:** practical personal, administrative, and financial foundations.  
**Milestones:** organize records, communication, goals, administrative categories, basic budget/checklist.  
**Offers:** tools, educational checklists, coordination, document organization, provider connections.  
**Guardrail:** distinguish clerical assistance from legal, tax, credit, or financial advice.

## 03 — Emprende

**Question:** “¿Cómo convierto mi idea en un negocio organizado?”  
**Outcome:** move from idea to an appropriate operating foundation.  
**Milestones:** clarify offer/customer, readiness, name, evaluate entity needs, applicable registrations, EIN when appropriate, banking/records, basic presence.  
**Offers:** setup coordination, permitted filings/admin, brand/website packages, referrals.  
**Guardrail:** do not recommend legal entity, tax election, or structure as individualized advice without a verified qualified professional.

## 04 — Protégete

**Question:** “¿Qué debo mantener, documentar o cubrir?”  
**Outcome:** establish a visible maintenance and risk-management rhythm.  
**Milestones:** bookkeeping workflow, obligations calendar, tax handoff, legal review when needed, insurance-needs review, document controls, reminders.  
**Offers:** bookkeeping, coordination, tax/insurance/legal referrals, document organization.  
**Guardrail:** label licensed roles and never guarantee compliance or protection.

## 05 — Crece

**Question:** “¿Cómo consigo clientes y construyo una presencia confiable?”  
**Outcome:** a measurable acquisition foundation.  
**Milestones:** positioning, brand, website, Google Business, CRM, lead capture, follow-up, channels, analytics.  
**Offers:** branding, web, local presence, CRM, automation, marketing.  
**Guardrail:** do not guarantee rankings, leads, revenue, or outcomes; publishing/advertising requires authorization.

## 06 — Evoluciona

**Question:** “¿Cuál es el próximo nivel de mi negocio?”  
**Outcome:** identify and operationalize a scalable growth lever.  
**Milestones:** document systems, delegation, automation, expansion, qualified financing review, partnerships, revisit risk.  
**Offers:** operations assessment, automation, CRM optimization, expansion roadmap, education/network.  
**Guardrail:** expansion, investment, lending, and employment can require regulated advice.

## Cross-stage interaction

1. **Recognize** the situation in plain language.
2. **Assess** with only necessary questions.
3. **Recommend** one current action and a short upcoming queue.
4. **Explain** why, requirements, provider, and limitations.
5. **Act** through resource, lead form, WhatsApp, or booking.
6. **Continue** by saving/sending progress and offering the next milestone.

## Trust moments

- Before data collection: purpose, privacy, and consent.
- Before recommendation: provider type and commercial relationship.
- Before handoff: what happens next and expected channel.
- Around regulated categories: contextual disclaimer and verified credentials.
- After submission: confirmation and next action.
- In proof: only authentic, consented testimonials without unsupported ratings.

## Shared content model

Keep journey content as typed data with stage ID/slug/order, customer question, summary, milestones, offering IDs, provider type (`direct`, `professional`, `partner`, `education`), disclaimer key, and CTAs. The same taxonomy should power Home, stage pages, questionnaire, roadmap, CRM tags, and future dashboard.

## Journey measurement

With documented consent: stage selection, roadmap starts/completions, abandonment, recommended action, conversions by stage/channel, and milestone progress. Do not collect unnecessary sensitive data.

## Implementation reference

The production-facing stage model is `data/journey/stages.ts`, its contracts are in `data/journey/types.ts`, and selector language/mapping is in `data/journey/intents.ts`.
