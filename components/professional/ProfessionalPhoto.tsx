"use client";

import { useState } from "react";

/** Native external images avoid Next Image's unconfigured remote-host optimizer.
 * If the source expires or rejects hotlinking, show an accessible fallback. */
export default function ProfessionalPhoto({ src, name, className = "" }: { src: string | null; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase() || "EV";
  return src && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={className} style={{ objectFit: /evolusa/i.test(name) && name.trim().toUpperCase() === "EVOLUSA" ? "contain" : "cover", objectPosition: /evolusa/i.test(name) && name.trim().toUpperCase() === "EVOLUSA" ? "center center" : "center 12%" }} />
  ) : (
    <span role="img" aria-label={name} className="flex h-full w-full items-center justify-center bg-[var(--sky-surface)] text-xl font-bold text-[var(--brand-navy)]">{initials}</span>
  );
}
