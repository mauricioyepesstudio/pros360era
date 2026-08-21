"use client";
import { useState, useTransition } from "react";
import { Check, RefreshCw } from "lucide-react";
import { lifeEvents } from "@/data/account/foundation";
import { cn } from "@/lib/cn";
import { toggleLifeEventAction } from "@/app/(account)/actions";

export default function LifeEvents({ selectedIds = [] as string[] }: { selectedIds?: string[] }) {
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [, startTransition] = useTransition();

  function toggle(eventId: string, category: (typeof lifeEvents)[number]["category"]) {
    const active = !selected.includes(eventId);
    setSelected((current) => (active ? [...current, eventId] : current.filter((id) => id !== eventId)));
    startTransition(() => {
      toggleLifeEventAction(eventId, category, active).catch(() => {
        setSelected((current) => (active ? current.filter((id) => id !== eventId) : [...current, eventId]));
      });
    });
  }

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[var(--brand-blue)]">
          <RefreshCw aria-hidden size={19} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-[var(--brand-navy)]">¿Cambió algo en tu vida?</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Los cambios que elijas ajustan tus recomendaciones y quedan guardados en tu cuenta.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {lifeEvents.map((event) => {
          const active = selected.includes(event.id);
          return (
            <button
              key={event.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(event.id, event.category)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-left text-sm font-semibold transition",
                active
                  ? "border-[var(--brand-blue)] bg-[var(--brand-navy)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--brand-navy)] hover:border-[var(--brand-blue)]",
              )}
            >
              {active && <Check aria-hidden size={15} />} {event.label}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="mt-4 text-sm font-semibold text-[var(--success)]" role="status">
          {selected.length} cambio{selected.length === 1 ? "" : "s"} guardado{selected.length === 1 ? "" : "s"} en tu cuenta.
        </p>
      )}
    </section>
  );
}
