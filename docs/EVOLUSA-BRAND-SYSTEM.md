# EVOLUSA — Brand System V1

Source of truth: owner-approved EVOLUSA identity board (`evolusa-identity-board.pdf`, actually a PNG saved with a `.pdf` extension — provided via Downloads, not committed to this repo). This document records what was implemented from it and what still needs the designer's real production files.

## 1. Brand architecture

- **Primary signature**: isotype + wordmark side by side.
- **Wordmark**: "EVOLUSA" — "EVOL" in navy, "USA" in red, small white 5-point stars embedded in the red letterforms, a red diagonal accent stroke crossing near the "V".
- **Isotype**: a navy chevron ("V") overlapping a red triangular peak ("A") containing 3 white stars, sitting above a curved arc/swoosh (navy with 2 small stars, tapering to a red tail). Works standalone.
- **Stacked signature**: isotype above the wordmark, centered.

## 2. Official colors

From the board's own color swatches (used as ground truth over an earlier verbal brief that had slightly different digits — `#06183A`/`#F20024`):

| Token | Hex | Role |
|---|---|---|
| `--evolusa-navy` | `#061B3A` | Authority, trust, background |
| `--evolusa-red` | `#F20D24` | Primary brand/action/emphasis — the vivid red CTA color |
| `--evolusa-white` | `#FFFFFF` | Clarity, space |

All three are defined once in `app/globals.css` and never hardcoded elsewhere. Semantic tokens derive from them: `--brand-navy`, `--brand-navy-strong`, `--brand-red`, `--brand-red-strong`. `--brand-coral`/`--brand-coral-strong` are kept as compatibility aliases pointing at the same red — several account-side files (`OnboardingFlow.tsx`, `AuthFoundation.tsx`, `RoadmapBoard.tsx`, the dashboard page) already reference `--brand-coral` directly, so repointing the token was enough to bring them on-brand without individually editing those files.

**Functional blue is preserved on purpose.** `--brand-blue` (`#2563EB`) remains in use for: the EVOLUSA Path's progress fill and past-stage nodes, the Stage Selector's active-choice indicator, tab/selected states in Services, and informational badges. It is no longer used for any primary CTA — every primary button (`Button.tsx`, `ButtonLink.tsx`) now renders in `--brand-red`. Red never appears as a decorative fill or a second "also-primary" color; it's reserved for the single active/current-stage node in the Path and true primary actions.

## 3. Logo assets — what's final vs. temporary

**No vector source file (AI/EPS/SVG) was available** — only the identity board raster image. Per the brief's own instruction ("if raster-only, create clean reusable architecture, do not fabricate different geometry"), the following are **temporary raster crops**, alpha-masked to transparency, cropped directly from the board:

- `public/brand/evolusa-primary.png` — full color signature (isotype + wordmark)
- `public/brand/evolusa-wordmark.png` — wordmark only, color
- `public/brand/evolusa-isotype.png` — isotype only, color
- `public/brand/evolusa-wordmark-reverse.png` — wordmark only, white-on-transparent (cropped from the board's own "reverso" swatch)
- `app/icon.png`, `app/apple-icon.png`, `public/icon-512.png`, `public/apple-icon-180.png` — generated from the isotype crop, composited onto a white rounded-square, matching the board's own app-icon pattern

**Flagged for production vector replacement**: all of the above. Hand-tracing this mark's bezier curves from a compressed raster would risk shipping an inaccurate reinterpretation — exactly what "do not simplify the isotype / do not invent new star geometry" rules out. The moment a real vector (SVG/AI/EPS) exists, swap these files 1:1 — every component reads from these exact paths, so no component code changes would be needed.

**Not built as static files** (deviation, disclosed): `evolusa-primary-reverse.png` and `evolusa-isotype-reverse.png` from the requested six-file list. The board has no true reverse (white-only) isotype art — only the color isotype and a white wordmark swatch exist. Rather than inventing a flattened white isotype that isn't in the source material, `EvolusaIsotype`'s `variant="reverse"` composes the real color isotype inside a white circular chip at render time — this is the board's own documented pattern for dark/photographic backgrounds (see its app-icon and social-avatar sections, which use exactly this white-chip treatment). `EvolusaLogo`'s `variant="reverse"` uses the real white wordmark crop. Monochrome variants (`monochrome-navy/white/red`) are done via CSS `mask-image` against the primary/isotype PNGs, so they're pixel-accurate to the real shape at any solid color, not a separate asset.

## 4. Components

- `components/brand/EvolusaLogo.tsx` — full signature, `variant`: primary/reverse/monochrome-navy/monochrome-white/monochrome-red, `size`: compact/header/document/app.
- `components/brand/EvolusaIsotype.tsx` — standalone mark, same variant/size matrix.
- `components/brand/EvolusaStageBadge.tsx` — the board's circular "insignia de etapa" (dashed border, stars, ETAPA, numeral, stage name), driven by real `journeyStages` data via a `stageId` prop.
- `components/evolusa/BrandMark.tsx` — kept as a thin compatibility wrapper around `EvolusaLogo` so its 8 existing call sites (SiteHeader, Footer, AccountShell ×2, login, signup, OnboardingFlow) picked up the real logo with zero per-file changes.

## 5. Where the stage badge is used (V1)

Only the diagnostic's preliminary result screen (`OnboardingFlow.tsx`) — the moment the brief calls out as "EVOLUSA understood the user." Not used decoratively elsewhere yet; Roadmap/dashboard/document/social placements are documented here as the next candidates, not implemented this round (see §10, "not done").

## 6. Photography direction

Unchanged from the V4 pass: full-bleed, cinematic, luminous (never dark/moody in the Hero specifically), documented replaceable slots in `data/photography/slots.ts`. The Hero's temporary photo crop was raised (`object-position: center 18%`) to expose more sky per this round's direction.

## 7. Motion language

Framer Motion, still governed by the single `<MotionConfig reducedMotion="user">` in `app/page.tsx`. New in this pass: the red underline swoosh beneath the Hero headline draws in once on load (`scaleX` 0→1, no loop). Everything else motion-wise is unchanged from V4.

## 8. CTA hierarchy

Primary action = red (`Button`/`ButtonLink` `primary` variant). Functional/selected/progress state = blue. Secondary/tertiary actions stay text-links in navy. Never both red and blue competing as "primary" on the same screen.

## 9. Accessibility

- Red is never the sole signal of an error or state — `--danger` uses the brand red, but existing error UI (where present) pairs it with icon/text, not color alone.
- `EvolusaLogo`/`EvolusaIsotype` images carry `alt="EVOLUSA"`; monochrome mask-based variants use `role="img"` + `aria-label="EVOLUSA"`.
- `EvolusaStageBadge` is `role="img"` with a full `aria-label` ("Etapa 3: Emprende") rather than relying on visually-split spans.
- No existing focus/contrast/keyboard behavior was changed by this pass — only colors and the addition of real logo assets.

## 10. Not done this round (disclosed, not silently skipped)

- Header transparent-over-hero integration (brief said "prefer... if contrast remains accessible" — soft language; this needs a scroll-state listener and was scoped out under time constraints, kept as the current opaque sticky bar with the real logo/CTA colors applied).
- Isotype loading-state animation.
- Social avatar circular crop as a distinct asset.
- Extending the stage badge to Roadmap/dashboard/documents.
- Sound: untouched, per explicit instruction — see the existing `docs/SOUND-ARCHITECTURE.md`.

## 11. Do not touch (unchanged)

Supabase, Auth, RLS, persistence, Roadmap Engine logic, Life Events logic, diagnostic question/answer logic, account architecture, database contracts, service compliance rules (`data/compliance/claims.ts`) — nothing in this pass touched any of these; only presentation-layer color/asset/copy changes.
