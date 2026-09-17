# Personal-Network Outreach Drafts — Professional Recruitment

**These are drafts for Mauricio's own personal use** — texts/WhatsApp messages he can copy-paste and send himself to people he already knows. This is **not** public EVOLUSA copy, so it does not need to clear `compliance-reviewer`/`taste` the way a social post or ad would. That said, every claim below is grounded in the current live product (see "What's actually true today" below), and I've flagged anywhere a draft could slide into overpromising — **read the flags before sending anything.**

Target candidates, per `docs/CURRENT-STATE.md` ("First real (non-demo) professional onboarded" section): wife (Notary), neighbor (Tax preparer), and unnamed paralegal/realtor/lawyer contacts, following the same operator runbook Mauricio used on himself (`supabase/migrations/0005_evolusa_professional_foundation.sql`'s trailing comments).

---

## What's actually true today (grounding — don't send anything that contradicts this)

- **Live and routing real opportunities**: `BUSINESS_MARKETING` and `BUSINESS_OPERATIONS`, Florida only (`data/compliance/claims.ts`, `docs/CURRENT-STATE.md` Milestone 04A/04F). Two real needs are selectable today: "Definir mi marca" / "Crear o mejorar mi sitio web" (Marketing) and "Organizar mi seguimiento de clientes" (Business Ops) — `data/needs/catalog.ts`.
- **Notary**: the regulated-category migration (`0013`) is authored and twice security-reviewed but **not applied** to the live database. Even once applied, a notary still needs Mauricio to manually verify their FL commission before they can receive a real routed match — that's an explicit, separate step, not automatic. Today: a Notary contact cannot get a real client through EVOLUSA yet. This is the closest not-yet-live category to shipping.
- **Tax preparer**: no migration exists at all for TAX — it's only listed in the compliance claims catalog as a category that would require verification if/when built. There's no authored schema, no timeline. This is meaningfully earlier-stage than Notary — don't imply it's "almost ready."
- **Legal / paralegal / lawyer contacts**: same as Tax — `LEGAL` exists only in the compliance category list, nothing built.
- **Realtor contacts**: there isn't even a compliance category defined for real estate yet (`data/compliance/claims.ts`'s `serviceCategories` list has no real-estate entry at all). This is earlier-stage than Tax/Legal — be the most conservative here.
- **No self-service professional signup exists anywhere yet.** Every real professional profile (Daniela the demo, Mauricio himself) was created by Mauricio manually promoting a normal member account to `PROFESSIONAL` and building the profile directly in Supabase, per the `0005` runbook. So even for an already-live category, the honest ask is "make a normal account, then I'll personally set up your professional profile" — not "sign up as a professional," which isn't a real flow yet.
- **`/aplicar-profesional` is currently gated off.** The public interest-capture form exists in code but its backing table (`0014`) isn't applied, so visitors today see a "contact us directly" fallback (WhatsApp/phone), not a working form. Don't tell a personal contact "go fill out the form on the site" — it won't do anything beyond showing them Mauricio's own contact info, which is pointless when he's already texting them directly.
- **No stable public production URL exists right now** (`docs/CURRENT-STATE.md`, "CURRENT BLOCKERS" — the live Vercel production deploy is stale, the real build only exists on preview links tied to the `feat/evolusa-migration` branch). Don't send anyone a signup link yet — handle account creation directly with them (in person, on a call, or once a stable URL exists).

---

## Version A — Already-live category (e.g., a marketing / business-ops contact)

Use this for anyone in Mauricio's network who genuinely does marketing, branding, web, CRM/sales-ops, or similar business-operations work — the two categories actually routing real client matches today.

> Hola [Nombre]! ¿Cómo has estado? Te escribo porque estoy construyendo algo que se llama EVOLUSA — conectamos a la comunidad hispana en EE.UU. con profesionales de confianza cuando necesitan ayuda para crecer su negocio (marketing, branding, organizarse con sus clientes, etc.). Ya está funcionando de verdad, no es solo una idea — yo mismo tengo mi perfil ahí como profesional de Marketing.
>
> Me encantaría que fueras de los primeros profesionales verificados en la plataforma. Todavía estamos empezando (pocos clientes por ahora, va creciendo), así que quiero ser honesto: esto no es un torrente de clientes garantizados, es una oportunidad real pero temprana. Lo que sí te puedo ofrecer es armar tu perfil yo mismo, sin costo por ahora.
>
> ¿Tienes 10 minutos esta semana para que te cuente cómo funciona y veamos si te interesa?

**Flags for this version:**
- Don't add a specific number of leads/clients — none exists yet in real volume. The draft deliberately says "no es un torrente... temprana," which is accurate; don't let this get edited into an implied pipeline.
- Don't attach a signup link — there's no stable public URL yet. The ask is a conversation, not a click-through.
- If pricing/fee structure comes up in the follow-up conversation, that's a real business decision Mauricio needs to make (connection fees, commission, free founding-professional period) — not something to promise in this first message since no agreed structure exists yet that I can find in the repo.

---

## Version B1 — Notary (wife), not-yet-live but closest to shipping

> Hola mi amor, quiero contarte algo de EVOLUSA en lo que he estado trabajando. La idea es conectar a la comunidad hispana con profesionales verificados — y quiero que tú seas la primera Notary en la plataforma, apenas esté lista esa parte.
>
> Para ser honesto: todavía no está activa. Ya está construida técnicamente casi toda la parte de Notaría en el sistema, pero falta que yo apruebe un último paso antes de que pueda recibir clientes reales — y aún así, vas a necesitar que yo verifique tu comisión de notario de la Florida antes de que puedas recibir tu primer caso por la plataforma. No es "ya, ya" pero sí está cerca, más que cualquier otra categoría nueva que tengo en mente.
>
> No hay nada que firmar ni pagar ahora. Solo quiero reservarte el primer lugar y contarte bien cómo funcionaría cuando se active. ¿Hablamos con calma este fin de semana?

**Flags for this version:**
- "Casi toda la parte... construida técnicamente" is accurate (migration `0013` is authored and reviewed) but make sure this doesn't get shortened in editing to just "ya casi está lista" without the verification-step caveat — the credential-verification step is a hard gate in the code (`create_qualified_opportunity`/`consent_and_route_opportunity`), not a formality.
- Don't give a date. Nothing in the repo commits to a timeline for applying `0013` — that's explicitly an "owner sign-off" pending item, not a scheduled release.

## Version B2 — Tax preparer (neighbor), not-yet-live and earlier-stage than Notary

> Hola [Nombre], ¿cómo estás? Te quiero contar de algo que estoy construyendo, EVOLUSA — conecta a la comunidad hispana con profesionales de confianza para distintas cosas (marketing, trámites, etc.). Ya está funcionando en un par de categorías.
>
> Impuestos todavía no es una de ellas — a diferencia de otras partes que ya tengo casi listas técnicamente, la categoría de impuestos ni siquiera la he empezado a construir todavía, así que honestamente no te puedo dar una fecha. Pero es justo el tipo de profesional que quiero tener desde el día uno cuando la active, y prefiero apartarte el lugar ahora que esperar.
>
> ¿Te late que te cuente más y quedamos en contacto para cuando esté lista esa parte?

**Flags for this version:**
- This is deliberately more tentative than the Notary version — Tax has zero schema/migration work behind it (unlike Notary's authored `0013`). Don't let this get merged with the Notary message's "está cerca" language; that would overstate where Tax actually is.
- No commitment to "you'll be the one" exclusivity is made beyond "first in line" — don't add exclusivity/guarantee language not already here.

## Version B3 — Generic template: paralegal / realtor / lawyer contacts

> Hola [Nombre], quería contarte de un proyecto que tengo, EVOLUSA — conecta a la comunidad hispana con profesionales de confianza cuando necesitan ayuda para avanzar (negocio, trámites, etc.). Ya tiene un par de categorías funcionando de verdad.
>
> [Legal/trámites de bienes raíces] todavía no es parte de la plataforma — es algo que me gustaría construir más adelante, pero hoy no tengo ni fecha ni un plan concreto todavía, así que no quiero venderte algo que no existe. Lo que sí quiero es tenerte en mente como de las primeras personas a quien llamar si esa parte se activa. ¿Te parece si seguimos en contacto?

**Flags for this version:**
- For a **realtor** specifically: real estate isn't even a defined category in the compliance catalog (`data/compliance/claims.ts`'s `serviceCategories`) — there's less to point to than Tax or Legal. Keep this version's language, not the Notary version's "está cerca" framing, for a realtor contact.
- For **paralegal/lawyer**: `LEGAL` is a named category in the compliance catalog with a defined (non-direct) fulfillment model, but nothing is built — same "no fecha, no plan concreto" honesty applies.
- Don't imply EVOLUSA would ever directly provide legal advice/services even once "live" — any future Legal category would route to an independent licensed professional, same non-negotiable structure as every regulated category (`data/compliance/claims.ts`).

---

## Needs real business input (not invented here)

- **Fee/commission structure** for these "founding professional" cohort members — no agreed pricing model exists in the repo for me to reference; Mauricio should decide before this comes up in a real conversation, not promise "free" or a rate off the cuff.
- **Timeline commitments** for applying `0013` (Notary) or starting Tax/Legal/real-estate categories — genuinely undecided; don't let any draft above get edited to include a date.
- **Legal entity name** for anything that becomes a real agreement with these contacts (`config/brand.ts` still has `legalName: "Por confirmar"` per `docs/EVOLUSA-BRAND-BOOK.md` §1) — needs to be confirmed before any of this becomes a signed relationship, not just a friendly heads-up text.

---

**These drafts do not need `compliance-reviewer`/`taste` sign-off** (personal 1:1 messages to people Mauricio already knows, not published EVOLUSA copy) — but if any of this language later gets reused as public-facing recruitment copy (a LinkedIn post, a page on the site, etc.), that version absolutely does need `compliance-reviewer` and `taste` before it ships, per the standing rule in `docs/CURRENT-STATE.md`'s "Growth/Social Media Launch" section.
