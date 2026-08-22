# EVOLUSA — Desktop Visual Lock (RETIRED)

## STATUS: RETIRED

This architecture has been removed from the codebase. `HeroDesktopLock.tsx` is deleted; `app/page.tsx` renders the real `SiteHeader`/`Hero`/`ProductReveal` components unconditionally on every breakpoint again. The reference image is archived (not served) at `assets-archive/evolusa-hero-desktop-lock-REFERENCE-RETIRED.png`.

This retirement was done per an explicit "FINAL HOME IMPLEMENTATION" directive: the static-screenshot approach was always meant to be temporary (see the original notes below, kept for history), and the live components have since been reconstructed and re-tuned directly against the approved reference (`evolusa-home-final-approved.png`) instead.

The one specific limitation this lock introduced — `#roadmap` hash-links not auto-scrolling on desktop — no longer applies, since the real `ProductReveal` (with its real `id="roadmap"`) is live on all breakpoints again.

---

## Original notes (historical — kept for context, no longer current)

- `evolusa-hero-desktop-lock.png` was the approved desktop **GOLDEN MASTER** visual — a screenshot used directly as the rendered desktop Header/Hero/Path/Product Reveal composition, to stop composition drift after repeated live-component reconstruction attempts kept diverging from the approved result.
- It was explicitly temporary from the start — the plan was always to reconstruct the same composition with live, responsive components once time allowed, which is what has now happened.
