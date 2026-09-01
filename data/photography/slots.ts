/**
 * Registry of every photography slot on the public home page. Each slot is a
 * documented, replaceable contract — swap `tempSrc` (or add a new one) and
 * every component reading it updates automatically; no layout/component
 * changes needed to ship final photography later. No placeholder gradient
 * here is a final asset — each is flagged `finalReplacementRequired: true`.
 *
 * Six narrative slots cover the whole page's imagery, reused deliberately
 * across Journey (small stage scene) and Life Story (larger full-bleed
 * moment) rather than commissioning one photo per surface — see each
 * section's usage for exactly where a slot recurs.
 */
export type PhotoSlot = {
  id: string;
  purpose: string;
  aspectRatio: string;
  /** Path under /public, or undefined to render the placeholder treatment. */
  tempSrc?: string;
  /** Crop anchor for next/image `object-position`, only used when tempSrc is set. */
  objectPosition?: string;
  finalReplacementRequired: true;
  note?: string;
};

export const photoSlots = {
  hero: {
    id: "hero",
    purpose: "Hero — full-viewport aspirational 'possibility' moment. Must read luminous and optimistic, never dark or moody.",
    aspectRatio: "21/11",
    tempSrc: "/images/hero/hero-family-2x.webp",
    objectPosition: "center 26%",
    finalReplacementRequired: true,
    note: "TEMPORARY — staged/posed stock genre with a generic skyline backdrop, placeholder-quality, not a final brand asset. Priority #1 for the real photography shoot. This registry default is no longer read at runtime for the hero slot — both callers now always pass an explicit override: sections/home/Hero.tsx (mobile/tablet, aspect-[16/9] band, 'center 15%') and sections/home/HeroArtboard.tsx (desktop, artboard aspect 1024/890, '80% 50%', measured against the approved reference's family bounding box). Kept here for documentation/history rather than deleted. 2026-08-31: swapped to hero-family-2x.webp (3072x2048, local Lanczos+unsharp upscale of the original 1536x1024 source, plus PhotoSlot.tsx's sizes prop fixed for HeroArtboard's near-full-bleed render) — the desktop image was rendering visibly soft because HeroArtboard scales the photo 1.28x via CSS transform on top of next/image previously requesting only a 50vw-sized source. Original kept at hero-family.webp for reference.",
  },
  arrival: {
    id: "arrival",
    purpose: "Newly arrived individual beginning a new chapter. Used in Journey (Llega) and reserved for Life Story if needed.",
    aspectRatio: "4/3",
    tempSrc: "/images/journey/arrival.jpg",
    objectPosition: "center",
    finalReplacementRequired: true,
    note: "TEMPORARY — AI-generated (owner-authorized) stand-in, not a final brand asset. Same placeholder-quality status as the Hero photo until a real shoot happens.",
  },
  stability: {
    id: "stability",
    purpose: "Couple/family building a home and everyday stability. Used in Journey (Establécete) and Life Story.",
    aspectRatio: "4/3",
    tempSrc: "/images/journey/stability.jpg",
    objectPosition: "center",
    finalReplacementRequired: true,
    note: "TEMPORARY — AI-generated (owner-authorized) stand-in, not a final brand asset. Same placeholder-quality status as the Hero photo until a real shoot happens.",
  },
  protection: {
    id: "protection",
    purpose: "Business owner reviewing bookkeeping/insurance/tax obligations to keep what they built safe. Used in Journey (Protégete).",
    aspectRatio: "4/3",
    tempSrc: "/images/journey/protection.jpg",
    objectPosition: "center",
    finalReplacementRequired: true,
    note: "TEMPORARY — AI-generated (owner-authorized) stand-in, not a final brand asset. Same placeholder-quality status as the Hero photo until a real shoot happens.",
  },
  entrepreneurship: {
    id: "entrepreneurship",
    purpose: "Entrepreneur building/opening a business. Used in Journey (Emprende) and Life Story.",
    aspectRatio: "4/3",
    tempSrc: "/images/journey/entrepreneurship.jpg",
    objectPosition: "center",
    finalReplacementRequired: true,
    note: "TEMPORARY — AI-generated (owner-authorized) stand-in, not a final brand asset. Same placeholder-quality status as the Hero photo until a real shoot happens.",
  },
  growth: {
    id: "growth",
    purpose: "Growing business / professional momentum. Used in Journey (Crece) and Life Story.",
    aspectRatio: "4/3",
    tempSrc: "/images/journey/growth.jpg",
    objectPosition: "center",
    finalReplacementRequired: true,
    note: "TEMPORARY — AI-generated (owner-authorized) stand-in, not a final brand asset. Same placeholder-quality status as the Hero photo until a real shoot happens.",
  },
  achievement: {
    id: "achievement",
    purpose: "Personal/professional achievement, the EVOLUCIONA moment. Used in Journey (Evoluciona).",
    aspectRatio: "4/3",
    tempSrc: "/images/journey/achievement.jpg",
    objectPosition: "center",
    finalReplacementRequired: true,
    note: "TEMPORARY — AI-generated (owner-authorized) stand-in, not a final brand asset. Same placeholder-quality status as the Hero photo until a real shoot happens.",
  },
} satisfies Record<string, PhotoSlot>;

export type PhotoSlotId = keyof typeof photoSlots;

/** Which narrative slot illustrates each journey stage's "visual moment." */
export const stagePhotoSlot: Record<string, PhotoSlotId> = {
  LLEGA: "arrival",
  ESTABLECETE: "stability",
  EMPRENDE: "entrepreneurship",
  PROTEGETE: "protection",
  CRECE: "growth",
  EVOLUCIONA: "achievement",
};
