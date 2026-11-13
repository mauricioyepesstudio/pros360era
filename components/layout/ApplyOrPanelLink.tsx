"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAccountRole } from "@/components/layout/useAccountRole";
import { PROFESSIONAL_HOME } from "@/lib/account/navigation";

/**
 * "Aplicar" for visitors and applicants; a professional (or the owner) who
 * is already in sees the way to their panel instead of being asked to apply.
 */
export default function ApplyOrPanelLink({ label, className }: { label: string; className: string }) {
  const { role } = useAccountRole();
  const inside = role === "PROFESSIONAL" || role === "ADMIN";
  return (
    <Link href={inside ? PROFESSIONAL_HOME : "/aplicar-profesional"} className={className}>
      {inside ? "Ir a mi panel profesional" : label} <ArrowRight aria-hidden size={18} />
    </Link>
  );
}
