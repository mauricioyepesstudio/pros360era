# EVOLUSA — Brand Book

Consolidated, non-technical reference for anyone writing copy, running social media, or representing EVOLUSA publicly. For implementation details (component APIs, CSS tokens, exact file paths used in code), see [EVOLUSA-BRAND-SYSTEM.md](./EVOLUSA-BRAND-SYSTEM.md) — this doc doesn't duplicate that one, it sits above it.

## 1. Identity

| Field | Value |
|---|---|
| Name | EVOLUSA |
| Tagline | "Tu próximo paso." |
| Positioning | "Tu camino para avanzar en Estados Unidos." |
| One-line description | EVOLUSA te ayuda a identificar tu próximo paso para establecerte, emprender y crecer en Estados Unidos. |
| Mission | Conectar a inmigrantes hispanohablantes con profesionales verificados, en el momento exacto en que los necesitan. |
| Locale | Español (es-US) primero; inglés (en-US) soportado. |

Source of truth for these fields: `config/brand.ts`.

**Legal entity — open item.** Public copy (this session's social media rollout, `app/profesionales/preview-mauricio/page.tsx`) refers to "Real Group Entertainment LLC" as the operating entity, and the shared contact email is `rgentertainmentmanagement@gmail.com`. `config/brand.ts` still has `legalName: "Por confirmar"` — **the exact legal name has never been formally confirmed and written into the single source of truth.** Before this name goes on any signed contract, invoice, or ToS/Privacy page, confirm the exact legal name (with LLC suffix, state of formation) and update `config/brand.ts` — every component should read from there, not have the name typed in ad hoc a second time.

## 2. Colors

| Token | Hex | Role |
|---|---|---|
| Navy | `#061B3A` | Authority, trust, primary background |
| Red | `#F20D24` | Primary brand/action/emphasis |
| White | `#FFFFFF` / `#FAFAF8` | Clarity, space |
| Functional blue | `#2563EB` | Progress/selected-state only — never a primary CTA |

Full token list and CSS variable names: `app/globals.css` and §2 of EVOLUSA-BRAND-SYSTEM.md.

## 3. Logo system — usage rules (read this before putting the logo on anything)

Four real asset files exist, all in `public/brand/`, all fixed 2026-09-05 (see "Asset history" below):

| File | What it is | Use on |
|---|---|---|
| `evolusa-primary.png` | Isotype + full "EVOLUSA" wordmark, navy + red | **Light backgrounds only.** The navy portion is nearly invisible on dark/navy surfaces. |
| `evolusa-wordmark.png` | Wordmark only, navy + red | **Light backgrounds only**, same reason. |
| `evolusa-wordmark-reverse.png` | Wordmark only, white + red | **Dark/navy backgrounds.** This is the one to use on the navy hero, dark social cards, dark app chrome. |
| `evolusa-isotype.png` | Standalone mark, full color | **Light backgrounds only** — there is no true white/reverse version of the isotype (the "V" chevron is navy and disappears on dark). For a dark surface, either use the wordmark-reverse instead, or wrap the color isotype in a white circular chip (the code's own established pattern, see `EvolusaIsotype.tsx`'s `variant="reverse"`). |

**The one rule that actually matters**: never place the primary/wordmark/isotype files directly on a navy or dark background. This exact mistake shipped twice in this session's own work before being caught and fixed — it's an easy, repeatable error, not a one-off.

**Asset history**: all four files originally had binary (non-anti-aliased) alpha channels — zero intermediate transparency values — making them look jagged/pixelated at almost any real display size. Fixed 2026-09-05 via a proper premultiplied-alpha Lanczos upscale (4x), which smooths edges without altering the underlying artwork (no geometry was redrawn or reinterpreted, per the standing "do not invent star geometry" rule). No vector source (SVG/AI/EPS) exists yet — these remain temporary raster crops pending a real production vector, exactly as already flagged in EVOLUSA-BRAND-SYSTEM.md §3.

## 4. Typography

Poppins (`--font-poppins`), falling back to system sans-serif. One typeface across the whole product and all social/marketing material — don't introduce a second display font for social media "to stand out."

## 5. Voice & tone

- Direct, honest, never overselling. "Todavía en construcción" language is used deliberately on the live site rather than hiding gaps — keep that honesty in social copy too.
- First person plural ("conectamos", "te ayudamos"), never third-person corporate distance.
- Spanish-first, natural regional Spanish — not machine-translated-sounding.

## 6. Compliance guardrails — non-negotiable

Source of truth: `data/compliance/claims.ts`. Every piece of public copy (social posts, ads, page bios) must respect this, not just the in-product UI copy.

**Never say:**
- "Resultados garantizados" (or any absolute-outcome promise) — explicitly `PROHIBITED`.
- "Determinamos tu elegibilidad migratoria" — explicitly `PROHIBITED`.
- "Ofrecemos asesoría legal / diseñamos tu estrategia fiscal" as a direct EVOLUSA service claim — these require verification status EVOLUSA doesn't broadly have; use the safe alternative instead.

**Say instead:**
- "Te ayudamos a identificar tu próximo paso." (allowed)
- "Te conectamos con el recurso o profesional apropiado." (the approved safe alternative for anything that sounds like direct professional advice)
- "Orientación en español" (allowed, as long as it's true of the actual experience)

**Category status today** (only these are `DIRECT`/live — don't imply a category is active if it isn't): `MARKETING` and `BUSINESS_OPERATIONS`. `NOTARY` is activating. `TAX`, `LEGAL`, `IMMIGRATION`, `INSURANCE`, `BUSINESS_FORMATION`, `BOOKKEEPING` all require verification/referral and are not things EVOLUSA should imply it directly does today.

## 7. Social media presence

Set up 2026-09-05. Assets in `public/brand/social/`:

| File | Use |
|---|---|
| `EVOLUSA_Profile_1080x1080.png` | Profile picture — Facebook, Instagram, LinkedIn, TikTok, X (all platforms, one square crop) |
| `EVOLUSA_Facebook_Cover_1640x624.png` | Facebook Page cover |
| `EVOLUSA_LinkedIn_Cover_1584x396.png` | LinkedIn Company Page banner |
| `EVOLUSA_X_Header_1500x500.png` | X (Twitter) header |

**Page setup data:**

| Field | Value |
|---|---|
| Name | EVOLUSA |
| Category | Servicio de consultoría / Business consulting |
| Website | evolusa.vercel.app |
| Phone / WhatsApp | +1 (786) 604-1733 |
| Contact email | rgentertainmentmanagement@gmail.com |

**Bio (short, IG/TikTok/X):**
> Tu próximo paso. 🇺🇸 Conectamos inmigrantes hispanohablantes con profesionales verificados en EE.UU. Aplica como profesional 👇

**About (long, Facebook/LinkedIn):**
> EVOLUSA conecta a inmigrantes hispanohablantes con profesionales verificados en el momento exacto en que los necesitan — marketing, operaciones de negocio y notaría hoy, más categorías próximamente. Cada cliente ya pasó por un perfil de necesidad, elegibilidad y ubicación antes de llegar a ti. La confianza nunca se compra en EVOLUSA — se gana con verificación real.

**Channel roles** (don't post the same thing everywhere):
- **LinkedIn** — professional recruitment (the audience that applies at `/aplicar-profesional`).
- **Facebook/Instagram** — end-member trust-building and social proof.
- **TikTok** — build-in-public process content, short-form.
- **X** — real-time progress updates, same "building in public" register as TikTok.

## 8. Open decisions (need the owner, not more copy)

- Confirm the exact legal entity name for `config/brand.ts` (§1 above).
- Photo slots for 5 Journey stages still need real or licensed photography — see `data/photography/slots.ts` and CURRENT-STATE.md's "CURRENT BLOCKERS".
- Whether EVOLUSA sits under a broader "Real Group Entertainment" umbrella presentation (alongside BELONG and the design portfolio) is a separate, larger positioning decision — tracked in conversation, not yet a repo change.
