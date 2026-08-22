# EVOLUSA — Optional Sound Architecture (documentation only, V4)

No sound is implemented. This documents where optional sound could enhance the experience later, and the constraints any future implementation must respect.

## Constraints (non-negotiable)

- Never autoplay. No sound plays until a user explicitly enables it.
- Opt-in only, persisted per-viewer (e.g. `localStorage`), off by default on every visit until toggled on.
- Subtle UI/progress sounds only — never background music by default.
- Never required to understand or use the product; every sound must have a fully silent equivalent experience.
- Respect browser autoplay policies and `prefers-reduced-motion`/reduced-data user preferences — treat a reduced-motion preference as a signal to also default sound off and not prompt for it.
- A visible, always-reachable mute/unmute control once enabled — never a one-time prompt with no way back.

## Where sound could enhance the experience later

- **Product Reveal** (`sections/home/ProductReveal.tsx`): a single soft confirmation tone when the HOY/SIGUIENTE/DESPUÉS plan finishes revealing — reinforces "the plan is now visible" the same moment the visual reveal completes.
- **Stage Selector** (`sections/home/StageSelector.tsx`): a very quiet tick on selecting a stage, echoing the animated indicator — optional, easy to justify skipping entirely.
- **EvolusaPath progress** (`components/evolusa/EvolusaPath.tsx`): a subtle rising tone as the scroll-linked fill advances in the Hero — lowest priority, highest risk of feeling gimmicky; only worth it if user-tested well.

## Suggested future shape (not built)

A single `useOptionalSound()` hook backed by a small React context, storing an `enabled: boolean` flag in `localStorage`, exposing a `play(cue: "reveal" | "select")` function that no-ops when `enabled` is false or `prefers-reduced-motion`/reduced-data is set. No audio files exist in the repo yet — none should be added until this is prioritized as real work, not bundled silently into a visual pass.
