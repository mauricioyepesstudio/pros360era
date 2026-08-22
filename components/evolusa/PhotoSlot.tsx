import Image from "next/image";
import type { CSSProperties } from "react";
import { photoSlots, type PhotoSlotId } from "@/data/photography/slots";
import { cn } from "@/lib/cn";

type PhotoSlotProps = {
  id: PhotoSlotId;
  className?: string;
  /** Placeholder tone when no tempSrc exists yet. "luminous" for the Hero (never dark). */
  tone?: "luminous" | "navy" | "blue";
  priority?: boolean;
  /** Overrides the registry's objectPosition for this render only — e.g. a desktop-only crop that shouldn't apply on mobile. */
  objectPosition?: string;
};

const placeholderTones: Record<NonNullable<PhotoSlotProps["tone"]>, string> = {
  luminous: "bg-[radial-gradient(120%_100%_at_20%_0%,#fff_0%,var(--sky-surface)_45%,var(--warm-canvas)_100%)]",
  navy: "bg-gradient-to-br from-[var(--brand-navy)] via-[#132038] to-[var(--brand-blue-strong)]",
  blue: "bg-gradient-to-br from-[var(--brand-blue-strong)] via-[#173a86] to-[var(--brand-navy)]",
};

/**
 * Replaceable photography slot — see data/photography/slots.ts for the full
 * documented contract (purpose, aspect ratio, replacement requirement) per
 * slot id. Swap a slot's tempSrc there to ship a real photo; nothing here
 * or in the calling section needs to change.
 */
export default function PhotoSlot({ id, className, tone = "luminous", priority = false, objectPosition }: PhotoSlotProps) {
  const slot = photoSlots[id];

  if (slot.tempSrc) {
    return (
      <div className={cn("relative overflow-hidden", className)} style={{ aspectRatio: slot.aspectRatio } as CSSProperties}>
        <Image
          src={slot.tempSrc}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          style={{ objectFit: "cover", objectPosition: objectPosition ?? slot.objectPosition ?? "center" }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden", placeholderTones[tone], className)}
      style={{ aspectRatio: slot.aspectRatio } as CSSProperties}
    >
      <div className="absolute -right-16 -top-20 size-72 rounded-full bg-white/25 blur-3xl" />
      <div className="absolute -bottom-16 -left-10 size-64 rounded-full bg-[var(--brand-blue)]/15 blur-3xl" />
    </div>
  );
}
