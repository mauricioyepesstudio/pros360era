"use client";

import Link from "next/link";
import { useAccountRole } from "@/components/layout/useAccountRole";
import { PROFESSIONAL_PUBLIC_HOME, publicSideFor } from "@/lib/account/navigation";

type FooterLink = { label: string; href: string };

/**
 * A signed-in professional's "/" is the professional page, so links into
 * the usuario home (/#…) would land there without their anchor. They get
 * "Lo que recibes" instead; everyone else keeps the full list.
 */
export default function FooterLinks({ links }: { links: readonly FooterLink[] }) {
  const { role, view } = useAccountRole();
  const shown = publicSideFor(role, view) === "professional"
    ? [{ label: "Lo que recibes", href: `${PROFESSIONAL_PUBLIC_HOME}#lo-que-recibes` }, ...links.filter((item) => !item.href.startsWith("/#") && item.href !== PROFESSIONAL_PUBLIC_HOME)]
    : links;
  return (
    <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-300">
      {shown.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-white">{item.label}</Link></li>)}
    </ul>
  );
}
