"use client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { homeForRole, type AccountRole } from "@/lib/account/navigation";
import { setPreviewRoleAction } from "@/app/(account)/preview-actions";

/**
 * Only rendered in Vista preliminar (no Supabase): lets the owner look at
 * the member panel and the professional panel without real accounts. With
 * Supabase configured the role always comes from profiles.role.
 */
export default function PreviewRoleSwitch({ role, compact = false }: { role: AccountRole; compact?: boolean }) {
  const router = useRouter();

  async function choose(next: "MEMBER" | "PROFESSIONAL") {
    await setPreviewRoleAction(next);
    router.push(homeForRole(next));
    router.refresh();
  }

  return <div className={compact ? "" : "mt-3"}>{compact ? null : <p className="text-xs font-bold text-[var(--brand-navy)]">Ver como</p>}<div className={cn("grid grid-cols-2 gap-1 rounded-full p-1", compact ? "bg-[var(--sky-surface)]" : "mt-2 bg-white")} aria-label="Vista preliminar: ver como">{([["MEMBER", "Miembro"], ["PROFESSIONAL", "Profesional"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => choose(value)} aria-pressed={role === value} className={cn("min-h-9 rounded-full px-2 text-xs font-bold", role === value ? "bg-[var(--brand-navy)] text-white" : "text-[var(--muted)] hover:text-[var(--brand-navy)]")}>{label}</button>)}</div></div>;
}
