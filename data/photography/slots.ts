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
    tempSrc: "/images/hero/hero-family.webp",
    objectPosition: "center 18%",
    finalReplacementRequired: true,
    note: "TEMPORARY per V4 direction ('no placeholder gradient in Hero'). This is a staged/posed stock genre with a generic skyline backdrop — placeholder-quality, not a final brand asset. Priority #1 for the real photography shoot. Crop raised (center 18%) per V1 brand direction to expose more sky above the readability scrim.",
  },
  arrival: {
    id: "arrival",
    purpose: "Newly arrived individual beginning a new chapter. Used in Journey (Llega) and reserved for Life Story if needed.",
    aspectRatio: "4/3",
    tempSrc: undefined,
    objectPosition: undefined,
    finalReplacementRequired: true,
  },
  stability: {
    id: "stability",
    purpose: "Couple/family building a home and everyday stability. Used in Journey (Establécete, Protégete) and Life Story.",
    aspectRatio: "4/3",
    tempSrc: undefined,
    objectPosition: undefined,
    finalReplacementRequired: true,
  },
  entrepreneurship: {
    id: "entrepreneurship",
    purpose: "Entrepreneur building/opening a business. Used in Journey (Emprende) and Life Story.",
    aspectRatio: "4/3",
    tempSrc: undefined,
    objectPosition: undefined,
    finalReplacementRequired: true,
  },
  growth: {
    id: "growth",
    purpose: "Growing business / professional momentum. Used in Journey (Crece) and Life Story.",
    aspectRatio: "4/3",
    tempSrc: undefined,
    objectPosition: undefined,
    finalReplacementRequired: true,
  },
  achievement: {
    id: "achievement",
    purpose: "Personal/professional achievement, the EVOLUCIONA moment. Used in Journey (Evoluciona).",
    aspectRatio: "4/3",
    tempSrc: undefined,
    objectPosition: undefined,
    finalReplacementRequired: true,
  },
} as const satisfies Record<string, PhotoSlot>;

export type PhotoSlotId = keyof typeof photoSlots;

/** Which narrative slot illustrates each journey stage's "visual moment." */
export const stagePhotoSlot: Record<string, PhotoSlotId> = {
  LLEGA: "arrival",
  ESTABLECETE: "stability",
  EMPRENDE: "entrepreneurship",
  PROTEGETE: "stability",
  CRECE: "growth",
  EVOLUCIONA: "achievement",
};
