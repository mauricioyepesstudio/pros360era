# EVOLUSA — Temporary Desktop Visual Lock

## TEMPORARY DESKTOP VISUAL LOCK

- `public/images/hero/evolusa-hero-desktop-lock.png` is the approved desktop **GOLDEN MASTER** visual — it is the owner-approved reference image, used directly as the rendered desktop Header/Hero/Path/Product Reveal composition.
- This is **temporary** and **not the final production engineering architecture**. It exists to stop composition drift after repeated attempts to reconstruct the approved reference from live components (crop/scale/object-position tuning) kept diverging from the approved result.
- Desktop (`lg:` breakpoint, 1024px+) currently renders this static reference image directly, via `sections/home/HeroDesktopLock.tsx`, with real (invisible) link overlays for navigation and CTAs — see that file for the exact overlay coordinates and destinations.
- Mobile/tablet (below `lg:`) continue using the real, fully responsive components (`SiteHeader`, `Hero`, `ProductReveal`) — completely unchanged, untouched by this lock.
- **Final production work must reconstruct this exact approved composition using live, responsive components** (real typography, real photography, real Path/ProductReveal markup) **without visually changing it** — the golden master here is the target to build toward with real components, not a permanent substitute for them.
- The ~2.9MB raster asset (`evolusa-hero-desktop-lock.png`) must later be optimized or replaced with a properly compressed/production-ready export once the real component reconstruction ships.
- **Known temporary limitation:** on desktop, `#roadmap` hash-links (header nav "Roadmap" item, StageSelector's CTA, StageServices' "Ver el Roadmap", the closing CTA section) do not auto-scroll, because the real `id="roadmap"` element (`ProductReveal`) is `lg:hidden` on desktop. This is low-severity and accepted for this checkpoint — the roadmap panel is already fully visible in the static image without needing to scroll — and will resolve naturally once the real component reconstruction replaces the locked image.

## What to do when reconstructing for real

1. Rebuild Header/Hero/Path/Product Reveal as live, responsive components matching this exact reference pixel-for-pixel (or as close as real typography/photography allows).
2. Replace `evolusa-hero-desktop-lock.png` with final, optimized photography once available.
3. Remove `HeroDesktopLock.tsx` and the `lg:hidden`/`hidden lg:block` gating in `app/page.tsx` once the live desktop reconstruction is approved.
4. Confirm `#roadmap` hash-links work correctly again once `ProductReveal` is live on desktop.
