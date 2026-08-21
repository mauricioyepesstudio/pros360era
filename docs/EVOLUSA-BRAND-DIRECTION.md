# EVOLUSA — Brand Direction

## Brand idea

EVOLUSA represents visible forward movement in a new U.S. chapter. The system should feel like a clear path opening—not a government seal, patriotic souvenir, or traditional multiservices storefront.

The emotional territory is **earned progress**: first steps, an organized foundation, first customer, stability, ownership, education, independence, community, and compounding growth.

## Attributes

- Premium without feeling exclusive or cold.
- Human without sentimental clichés.
- Optimistic without promising outcomes.
- Modern/technological without becoming impersonal.
- American in context without political/patriotic iconography.
- Latino-friendly and Spanish-first without stereotypes.
- Trustworthy through clarity, restraint, and transparency.

## Wordmark direction—not a final logo

Use **EVOLUSA** as one lexical unit. Explore a controlled `EVOL` / `USA` distinction through color, weight, or letterform transition. The current code colors “EVOLU” and “SA”, which misses the intended boundary.

Directions for later exploration:

- **Evolution transition:** EVOL in navy, USA in a warmer accent, identical baseline/spacing.
- **Forward threshold:** subtle opening around the L/U transition, never a flag.
- **Path symbol:** abstract step, horizon, or route that works as a favicon.

Do not finalize a logo yet. First validate name availability, domain/social ownership, trademark risk, and small-size performance.

## Asset architecture

Prepare `wordmark-primary`, `wordmark-reverse`, independent `symbol`, simplified `favicon`, square `social-avatar`, horizontal/vertical lockups, and monochrome variants, with safe-area/minimum-size rules. Text assets need accessible equivalents.

## Color

Starting anchors:

- Navy `#0D1B3D`: trust and structure.
- Gold `#D4A23A`: warmth and earned achievement.
- Deep navy `#081329`: dark surfaces.

Evolve into semantic tokens: brand primary/accent and strong variants; surface/subtle/inverse; text/muted/inverse; border/focus; success/warning/error/info.

Gold should mark progress and selected actions, not long body text. Audit every combination: current gold on white may require a darker functional variant. Use an accessible green for completed roadmap items, and never rely on color alone.

## Typography

Poppins can remain for the MVP. Use strong but restrained headlines, sentence case, comfortable line lengths, aligned stage numerals, and limited all-caps/tracking. A later study should test distinctiveness and Spanish/English performance.

## Photography

Show credible progress: a first workspace/customer, a family organizing plans, real entrepreneurs at work, learning, ownership, keys, inventory, storefront preparation, and collaboration.

Use documentary realism, warm natural light, contemporary U.S. settings, capable subjects, compositional room for copy, and consistent grading. Avoid flags, eagles, Statue of Liberty, stars, politics, staged handshakes, call centers, and stereotypical “immigrant struggle”. Verify licenses/releases.

## Graphic language

Use paths, steps, checkpoints, horizons, nodes, 01–06 numerals, and completed/current/upcoming states. Motion should clarify sequence and respect reduced-motion preferences. Avoid making an upward arrow the whole identity.

## UI expression

- Hero: emotional image, concise promise, dominant Roadmap CTA.
- Selector: cards phrased as customer situations.
- Journey: connected but non-rigid path.
- Roadmap: the most distinctive, actionable and calm UI.
- Services: grouped by stage and fulfillment type.
- Trust: transparent process, verified providers, explicit disclosures.
- Forms: why-we-ask explanations, progress, complete error states.

Premium should come from hierarchy and craft—not excessive shadows, rounded cards, or decorative gold.

## Voice examples

Prefer:

- “Descubre tu próximo paso.”
- “Empieza desde donde estás.”
- “Te mostramos el camino y quién puede ayudarte.”
- “Este servicio es realizado por un profesional independiente. Ver detalles.”
- “Tu resultado es una guía inicial, no asesoría legal, fiscal o financiera.”

Avoid:

- “Nos ocupamos de todo.”
- “Crece legalmente” without reviewed meaning.
- “La mejor estrategia para tu caso.”
- “Toda la estructura legal.”
- “Resultados garantizados.”
- “Expertos” or “especialistas” without substantiation.

## Accessibility and inclusion

- Use clear, region-neutral Spanish and explain U.S./English terms.
- Never infer immigration status.
- Support keyboard, screen readers, zoom, contrast, reduced motion, mobile.
- Do not communicate roadmap status through color alone.
- Represent varied ages, skin tones, families, abilities, occupations, and progress stages.
- Author/review English localization; do not perform literal replacement.

## Validation checklist

- Counsel reviews name/trademark.
- Domain, email, social ownership confirmed—not assumed from config.
- Legal entity/public brand relationship approved.
- Marks tested small, monochrome, light/dark.
- Contrast audited.
- Image rights/releases documented.
- Claims and credentials substantiated.
- Voice tested with target customers.
- Stage/Roadmap language usability-tested.

## Implementation reference

The provisional textual mark is `components/evolusa/BrandMark.tsx`. CSS semantic tokens live in `app/globals.css`; `config/brand.ts` keeps unknown contact/legal values as explicit safe placeholders.
