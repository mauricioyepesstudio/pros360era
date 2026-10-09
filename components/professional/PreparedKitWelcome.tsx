import Link from "next/link";
import { ArrowRight, CalendarDays, ExternalLink, ImageIcon, Sparkles, UserRound } from "lucide-react";
import { creativeSrc, type PreparedKit } from "@/data/professional/prepared-kits";

/**
 * First thing a professional with a prepared kit sees in their panel: what the
 * team already left ready for them, and the few things only they can confirm.
 * No projections, no promised clients: only what exists.
 */
export default function PreparedKitWelcome({ kit, hasPhoto }: { kit: PreparedKit; hasPhoto: boolean }) {
  const preview = kit.creatives.concepts.slice(0, 3);
  const pending = hasPhoto ? kit.pendingConfirmations.filter((item) => !item.startsWith("Sube tu foto")) : kit.pendingConfirmations;

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] bg-[var(--brand-navy)] text-white shadow-[var(--shadow-md)]">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-blue-on-dark)]">
            <Sparkles aria-hidden size={14} />
            Preparado para ti
          </p>
          <h2 className="mt-3 text-balance text-2xl font-extrabold leading-tight sm:text-3xl">
            {kit.firstName}, tu espacio profesional ya está montado.
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-white/80">
            Pasamos tu hoja de vida a tu perfil, enlazamos tu LinkedIn{kit.project ? ` y ${kit.project.name}` : ""}, y dejamos tus creativos organizados por formato. Revísalo todo: nada se publica sin tu visto bueno.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            <li>
              <Link href="/panel-profesional/perfil" className="group flex items-center gap-3 rounded-[var(--radius-md)] bg-white/10 p-3 transition hover:bg-white/15">
                <UserRound aria-hidden size={20} className="text-[var(--brand-blue-on-dark)]" />
                <span className="flex-1 text-sm font-semibold">Tu perfil y trayectoria</span>
                <ArrowRight aria-hidden size={16} className="transition group-hover:translate-x-1" />
              </Link>
            </li>
            <li>
              <Link href="/panel-profesional/creativos" className="group flex items-center gap-3 rounded-[var(--radius-md)] bg-white/10 p-3 transition hover:bg-white/15">
                <ImageIcon aria-hidden size={20} className="text-[var(--brand-blue-on-dark)]" />
                <span className="flex-1 text-sm font-semibold">{kit.creatives.concepts.length} creativos listos para revisar</span>
                <ArrowRight aria-hidden size={16} className="transition group-hover:translate-x-1" />
              </Link>
            </li>
            <li>
              <Link href="/panel-profesional/planner" className="group flex items-center gap-3 rounded-[var(--radius-md)] bg-white/10 p-3 transition hover:bg-white/15">
                <CalendarDays aria-hidden size={20} className="text-[var(--brand-blue-on-dark)]" />
                <span className="flex-1 text-sm font-semibold">Tu planner de publicaciones</span>
                <ArrowRight aria-hidden size={16} className="transition group-hover:translate-x-1" />
              </Link>
            </li>
            {kit.project ? (
              <li>
                <a href={kit.project.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-[var(--radius-md)] bg-white/10 p-3 transition hover:bg-white/15">
                  <ExternalLink aria-hidden size={20} className="text-[var(--brand-blue-on-dark)]" />
                  <span className="flex-1 text-sm font-semibold">Abrir {kit.project.name}</span>
                  <ArrowRight aria-hidden size={16} className="transition group-hover:translate-x-1" />
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex gap-3" aria-hidden>
            {preview.map((concept, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={concept.id}
                src={creativeSrc(kit, concept.id, "4x5")}
                alt=""
                width={1080}
                height={1350}
                className="w-1/3 rounded-[var(--radius-sm)] shadow-lg ring-1 ring-white/10"
                style={{ transform: `rotate(${(index - 1) * 3}deg)` }}
              />
            ))}
          </div>
          <div className="rounded-[var(--radius-md)] bg-white p-5 text-[var(--brand-navy)]">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--brand-blue)]">Para terminar</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
              {pending.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
