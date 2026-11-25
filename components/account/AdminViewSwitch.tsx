import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Only for the owner (ADMIN): the one account that can open both panels.
 * Two plain links, blue for the usuario panel and red for the profesional
 * one; the route remembers the choice (app/api/account/vista).
 */
export default function AdminViewSwitch({ professional, compact = false }: { professional: boolean; compact?: boolean }) {
  const options = [
    { panel: "member", label: compact ? "Usuario" : "Panel de usuario", active: !professional, on: "bg-[var(--role-member)] text-white" },
    { panel: "professional", label: compact ? "Profesional" : "Panel profesional", active: professional, on: "bg-[var(--role-pro)] text-white" },
  ] as const;
  return (
    <div className={compact ? "" : "mt-4"}>
      {compact ? null : <p className={cn("text-xs font-bold", professional ? "text-white/70" : "text-[var(--muted)]")}>Ver como administrador</p>}
      <div className={cn("grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1", compact ? "" : "mt-2")} aria-label="Cambiar de panel">
        {options.map((option) => (
          <Link
            key={option.panel}
            href={`/api/account/vista?panel=${option.panel}`}
            prefetch={false}
            aria-current={option.active ? "page" : undefined}
            className={cn("flex min-h-9 items-center justify-center rounded-full px-2 text-center text-xs font-bold", option.active ? option.on : "text-[var(--muted)] hover:text-[var(--brand-navy)]")}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
