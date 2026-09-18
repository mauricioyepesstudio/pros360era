# EVOLUSA — Facebook/Instagram Content Calendar & Copy Bank (2026-09)

> **STATUS (2026-09-18): compliance + taste reviewed, approved as a batch with one wording fix (Post 8).** Nothing here is scheduled or posted yet — that's still a separate, explicit owner-authorized step (see the note at the end of this file). Compliance review confirmed every claim against `data/compliance/claims.ts` (MARKETING/BUSINESS_OPERATIONS are the only `DIRECT` categories; NOTARY correctly described as activating, not live) and found no outcome guarantees, no fabricated testimonials, and no regulated-category overreach. Taste review found the tone consistent with the brand's honest, non-urgency-manufacturing voice throughout. Post 8's original wording (below, replaced) conflated the approval gate with the separate "identidad verificada" badge — rewritten to name both explicitly.

Scope: **Facebook (@Evolusa) + Instagram (@evolusa.us) only**, per brand book §7 channel roles (these two are for member trust-building and social proof — LinkedIn is the professional-recruitment channel and isn't connected yet; TikTok/X are separate "building in public" registers). Content here is Spanish-first, matching EVOLUSA's actual audience.

---

## Ground rules applied to every post below

**Compliance (`data/compliance/claims.ts` + brand book §6) — non-negotiable:**
- No outcome guarantees ("resultados garantizados" language or equivalent) — `PROHIBITED`.
- Never imply EVOLUSA directly provides legal/immigration/tax/insurance/notary advice. Only `MARKETING` and `BUSINESS_OPERATIONS` are `DIRECT`/live today.
- **NOTARY is "activándose," not live** — migration `0013` is authored but not applied (`docs/CURRENT-STATE.md`). Copy says "se está activando," never that it's already matching.
- No fabricated testimonials or stats — there are zero real testimonials yet, so none are invented here.
- "Profesionales verificados" copy only claims what's structurally true today: every public professional passed an **approval gate** (`is_approved`) before being visible. It does **not** claim every professional has completed identity/credential verification (`identity_verified` is a separate, per-profile fact, not universal) — flagged inline on Post 8 for compliance-reviewer to double-check phrasing.

**No hardcoded URLs in captions.** Same reasoning already applied to the pending launch post in `docs/CURRENT-STATE.md`: no confirmed-stable production URL to hardcode into permanent post copy yet. Every CTA below says "enlace en nuestro perfil" (FB) / "link en bio" (IG) instead — consistent with the already-approved short bio ("Aplica como profesional 👇"), which should point the profile link itself at `/aplicar-profesional`.

**`/aplicar-profesional` currently shows a contact fallback, not a live form** (`professionalApplicationsAcceptingSubmissions = false`, migration `0014` not applied). Professional-facing copy below says "cuéntanos" / "contáctanos" / "te contactamos," never "llena el formulario," to match what a visitor actually experiences today.

**Asset rules (brand book §3) — confirmed per post below, not assumed:**
- `evolusa-primary.png`, `evolusa-wordmark.png`, `evolusa-isotype.png` → **light backgrounds only.**
- `evolusa-wordmark-reverse.png` → **the only file allowed on a navy/dark card.**
- `EVOLUSA_Profile_1080x1080.png` (the social profile picture) is treated as a **light-background asset** the same way — it's not documented as a reverse/dark variant in brand book §7, so it should only sit on light/warm-canvas cards, never dropped onto a navy background.
- No real launch photography exists (`data/photography/slots.ts` confirms the site's own photo slots are AI-generated placeholders, not final brand assets) — every visual below is either the profile picture or a simple text-on-brand-color card, exactly as the task calls for.

---

## Calendar view (2 weeks, 12 posts, ~6/week — Sun off both weeks)

| Day | Type | Post |
|---|---|---|
| Week 1 – Lun | Brand/trust (carried over) | 1. Launch post |
| Week 1 – Mar | Member-facing | 2. Stage journey explainer |
| Week 1 – Mié | Professional-facing | 3. Marketing/Ops invite (referral angle) |
| Week 1 – Jue | Brand/trust | 4. Honest early-stage |
| Week 1 – Vie | Member-facing | 5. Marketing category spotlight |
| Week 1 – Sáb | Brand/trust | 6. "Por qué EVOLUSA" |
| Week 2 – Lun | Professional-facing | 7. Business Operations invite |
| Week 2 – Mar | Member-facing | 8. What "verificado" actually means |
| Week 2 – Mié | Brand/trust | 9. Categories roadmap teaser |
| Week 2 – Jue | Professional-facing | 10. General/other-category intake |
| Week 2 – Vie | Member-facing | 11. Follow/community CTA |
| Week 2 – Sáb | Brand/trust | 12. Momentum + gratitude close |

Cadence is deliberately near-daily (Mon–Sat) for this first push, per the owner's growth priority — resting Sundays. Same copy runs on both FB and IG unless noted; IG gets hashtags and "link in bio," FB gets slightly fuller caption text and "enlace en el perfil."

---

## Copy bank

### 1. Launch post (carried over — brand/trust)
**Status:** this is the exact copy already drafted and pending its own owner go/no-go per `docs/CURRENT-STATE.md` — reproduced here unchanged so the calendar is complete, not re-opened for edits in this batch.

> 👋 Hola, somos EVOLUSA.
>
> Ayudamos a inmigrantes hispanohablantes en Estados Unidos a dar su próximo paso — conectándote con profesionales verificados, en el momento exacto en que los necesitas.
>
> Hoy ya puedes conectar con profesionales de Marketing y Operaciones de Negocio. Notaría se está activando, y seguimos creciendo cada semana.
>
> Nada de resultados garantizados, nada de promesas vacías — solo un camino honesto, paso a paso.
>
> Síguenos para acompañarte en el camino. 🇺🇸

**Visual:** unresolved in `CURRENT-STATE.md` (owner was deciding between text + `EVOLUSA_Profile_1080x1080.png` only, or a new square graphic). If a graphic is made: light warm-canvas (#FAFAF8) card with `evolusa-primary.png` — never navy background with this file.
**Cadence:** Week 1, Día 1.

---

### 2. Stage journey explainer (member-facing)

> ¿Qué significa "tu próximo paso" en EVOLUSA?
>
> Cada persona que llega a Estados Unidos pasa por etapas distintas: llegar, establecerte, emprender, proteger lo que construiste, crecer y evolucionar.
>
> En EVOLUSA identificamos en qué etapa estás y te ayudamos a encontrar el profesional o recurso adecuado para ese momento — no genérico, para TU momento.
>
> Hoy ya conectamos con profesionales de Marketing y Operaciones de Negocio. Seguimos sumando categorías.
>
> ¿En qué etapa estás tú? Cuéntanos en los comentarios. 👇

**Visual:** light warm-canvas card, `evolusa-primary.png` in a corner, six stage names (Llega, Establécete, Emprende, Protégete, Crece, Evoluciona) as simple text list — no icons/photography needed.
**IG hashtags:** #EVOLUSA #TuProximoPaso #InmigranteEnEEUU
**Cadence:** Week 1, Día 2.

---

### 3. Marketing/Ops invite — referral angle (professional-facing)

> ¿Eres profesional de marketing o te dedicas a operaciones de negocio? ¿O conoces a alguien que lo sea?
>
> En EVOLUSA buscamos profesionales para conectar con inmigrantes hispanohablantes que están construyendo su negocio en Estados Unidos.
>
> Hoy recibimos aplicaciones en Marketing y Operaciones de Negocio — Notaría se está activando pronto.
>
> Aplica o comparte esto con quien conozcas. Enlace en nuestro perfil. 🙌

**Visual:** navy card, `evolusa-wordmark-reverse.png` — this is the one file allowed on that background.
**IG hashtags:** #EVOLUSA #ProfesionalesLatinos #MarketingDigital
**Cadence:** Week 1, Día 3.

---

### 4. Honest early-stage (brand/trust)

> Vamos a ser honestos: EVOLUSA todavía está en construcción.
>
> No prometemos resultados garantizados ni atajos — prometemos un camino claro, en español, y profesionales verificados cuando los necesitas.
>
> Estamos creciendo cada semana. Gracias por ser de los primeros en caminar con nosotros. 🇺🇸

**Visual:** navy card, `evolusa-wordmark-reverse.png`, short quote-style typography treatment.
**Cadence:** Week 1, Día 4.

---

### 5. Marketing category spotlight (member-facing)

> ¿Tu negocio necesita ayuda con marketing — redes sociales, estrategia, contenido?
>
> En EVOLUSA te conectamos con un profesional de marketing verificado según tu ciudad y lo que necesitas.
>
> Así de simple: nos cuentas tu situación, identificamos tu próximo paso, y te conectamos.
>
> Síguenos y descubre cómo funciona. 👀

**Visual:** light card, `EVOLUSA_Profile_1080x1080.png` or `evolusa-isotype.png` — light background only.
**IG hashtags:** #MarketingParaNegocios #NegocioLatino #EVOLUSA
**Cadence:** Week 1, Día 5.

---

### 6. "Por qué EVOLUSA" (brand/trust)

> ¿Por qué EVOLUSA?
>
> Porque llegar a Estados Unidos y no saber por dónde empezar es más común de lo que parece. Porque encontrar un profesional de confianza no debería ser un lujo. Porque tu próximo paso merece orientación real, no adivinanza.
>
> Por eso existimos. 💛

**Visual:** light warm-canvas card, `evolusa-primary.png`.
**Cadence:** Week 1, Día 6 (Sábado, lighter/weekend tone).

---

### 7. Business Operations invite (professional-facing)

> ¿Ayudas a negocios a organizarse — procesos, herramientas, operaciones del día a día?
>
> En EVOLUSA conectamos profesionales de Operaciones de Negocio con dueños de negocio hispanohablantes que están creciendo en EE.UU. y necesitan poner orden en su operación.
>
> Si es lo tuyo, cuéntanos. Enlace en nuestro perfil.

**Visual:** navy card, `evolusa-wordmark-reverse.png`.
**IG hashtags:** #OperacionesDeNegocio #EmprendedoresLatinos #EVOLUSA
**Cadence:** Week 2, Día 8.

---

### 8. What "verificado" actually means (member-facing)

**Compliance review (2026-09-18): original draft approved with a wording fix.** The original copy said "cuando decimos 'profesionales verificados' hablamos en serio" and then defined that only as passing a review — but the platform separately shows an actual "identidad verificada" badge on some profiles (`identity_verified`), which is a stronger, different claim. Using "verificados" as the headline word while only describing the weaker approval gate risked a member reading the post and assuming every listed professional carries that badge. Rewritten below to name both layers explicitly rather than using "verificado" as one blanket word.

> Antes de aparecer en EVOLUSA, cada profesional pasa por una revisión — no cualquiera entra a la plataforma.
>
> Algunos perfiles además tienen la insignia "Identidad verificada" — una capa adicional, no automática para todos. Si la ves, significa exactamente eso.
>
> Seguimos construyendo esto con la misma honestidad de siempre: nada se compra, todo se gana.

**Visual:** light warm-canvas card, `evolusa-primary.png`.
**Cadence:** Week 2, Día 9.

---

### 9. Categories roadmap teaser (brand/trust)

> Hoy en EVOLUSA puedes conectar con profesionales de Marketing y Operaciones de Negocio. Notaría se está activando — pronto contamos más.
>
> Seguimos sumando categorías cada semana: eso es lo que significa construir esto contigo, no solo para ti.

**Visual:** light card with three simple text chips — "Marketing ✅ · Operaciones ✅ · Notaría 🔜" — `evolusa-primary.png`, light background only. (Do not word this as "Notaría ✅" — it isn't live.)
**Cadence:** Week 2, Día 10.

---

### 10. General/other-category intake (professional-facing)

> ¿Tienes experiencia profesional y quieres ser parte de la red EVOLUSA, aunque tu categoría todavía no esté activa en la plataforma?
>
> Cuéntanos. Registramos tu interés y te contactamos apenas esa categoría esté lista.
>
> Aplica en el enlace de nuestro perfil. 📩

**Visual:** navy card, `evolusa-wordmark-reverse.png`.
**IG hashtags:** #EVOLUSA #ProfesionalesEnEEUU
**Cadence:** Week 2, Día 11.

---

### 11. Follow/community CTA (member-facing)

> Si estás construyendo tu vida o tu negocio en Estados Unidos, este es tu lugar.
>
> Aquí compartimos lo que vamos aprendiendo, los profesionales que se van sumando, y tu próximo paso — sin relleno, sin promesas vacías.
>
> Síguenos y acompáñanos en el camino. 🇺🇸

**Visual:** light card, `EVOLUSA_Profile_1080x1080.png`.
**Cadence:** Week 2, Día 12.

---

### 12. Momentum + gratitude close (brand/trust)

> Llevamos poco tiempo, pero ya estamos construyendo algo real: una red de profesionales verificados para la comunidad hispanohablante en EE.UU.
>
> Gracias por seguirnos desde el inicio — cada persona que se une nos ayuda a crecer más rápido.
>
> ¿Ya nos sigues en Facebook e Instagram? 💛

**Visual:** navy card, `evolusa-wordmark-reverse.png`.
**Cadence:** Week 2, Día 13 (Sábado).

---

## Reviewed 2026-09-18 — owner sign-off is the only remaining step before scheduling.

Compliance and taste review are done (see the status note at the top). What's still needed before the first `create_post`/`create_image_post` call via the Meta Ads by Windsor.ai connector:
1. **Owner go/no-go on this batch as a whole** (or on individual posts) — publishing is always a separate, explicit, owner-authorized action, never automatic from a review passing.
2. **Confirm the profile bio link on both accounts points at `/aplicar-profesional`** so every "enlace en el perfil"/"link en bio" CTA resolves correctly.
3. **Facebook (`@Evolusa` Page) still needs its `pages_manage_posts` permission reconnected** — the first launch post failed on this exact permission gap (see `docs/CURRENT-STATE.md`'s "Update 2026-09-15"); Instagram posting already works. Reconnect via https://onboard.windsor.ai/connect?connector=facebook_organic&client=CLAUDE&next=/facebook_organic/authorize before Facebook posts in this calendar can go out.
