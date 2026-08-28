import Image from "next/image";
import type { CSSProperties } from "react";
import { Compass, FolderCheck, Rocket, ShieldCheck, TrendingUp, Sparkles, type LucideIcon } from "lucide-react";
import { photoSlots, type PhotoSlotId } from "@/data/photography/slots";
import { cn } from "@/lib/cn";

export type PhotoSlotIconName = "Compass" | "FolderCheck" | "Rocket" | "ShieldCheck" | "TrendingUp" | "Sparkles";

type PhotoSlotProps = {
  id: PhotoSlotId;
  className?: string;
  /** Placeholder tone when no tempSrc exists yet. "luminous" for the Hero (never dark). */
  tone?: "luminous" | "navy" | "blue";
  priority?: boolean;
  /** Overrides the registry's objectPosition for this render only — e.g. a desktop-only crop that shouldn't apply on mobile. */
  objectPosition?: string;
  /**
   * Shown centered in the placeholder while no real photo exists yet — the
   * same icon already assigned to this stage in data/journey/stages.ts, not
   * a new content decision. Never rendered once a real tempSrc exists.
   */
  icon?: PhotoSlotIconName;
};

const placeholderTones: Record<NonNullable<PhotoSlotProps["tone"]>, string> = {
  luminous: "bg-[radial-gradient(120%_100%_at_20%_0%,#fff_0%,var(--sky-surface)_45%,var(--warm-canvas)_100%)]",
  navy: "bg-gradient-to-br from-[var(--brand-navy)] via-[#132038] to-[var(--brand-blue-strong)]",
  blue: "bg-gradient-to-br from-[var(--brand-blue-strong)] via-[#173a86] to-[var(--brand-navy)]",
};

const placeholderIconColor: Record<NonNullable<PhotoSlotProps["tone"]>, string> = {
  luminous: "text-[var(--brand-navy)]/25",
  navy: "text-white/25",
  blue: "text-white/25",
};

const iconComponents: Record<PhotoSlotIconName, LucideIcon> = {
  Compass,
  FolderCheck,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Sparkles,
};

/**
 * Replaceable photography slot — see data/photography/slots.ts for the full
 * documented contract (purpose, aspect ratio, replacement requirement) per
 * slot id. Swap a slot's tempSrc there to ship a real photo; nothing here
 * or in the calling section needs to change.
 */
export default function PhotoSlot({ id, className, tone = "luminous", priority = false, objectPosition, icon }: PhotoSlotProps) {
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

  const Icon = icon ? iconComponents[icon] : null;

  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden", placeholderTones[tone], className)}
      style={{ aspectRatio: slot.aspectRatio } as CSSProperties}
    >
      <div className="absolute -right-16 -top-20 size-72 rounded-full bg-white/25 blur-3xl" />
      <div className="absolute -bottom-16 -left-10 size-64 rounded-full bg-[var(--brand-blue)]/15 blur-3xl" />
      {Icon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={placeholderIconColor[tone]} size={64} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
