import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";

/**
 * Small door to the professional side, for signed-out visitors only (owner,
 * 13-nov: the usuario home talks to usuarios). The full pitch, with its own
 * benefit cards and video, lives at /para-profesionales.
 */
export default function ProBand() {
  return (
    <section id="para-profesionales" aria-labelledby="pro-band-title" className="scroll-mt-24 bg-[var(--brand-navy)] py-12 text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--brand-red-strong)]"><Briefcase size={24} /></span>
          <div>
            <h2 id="pro-band-title" className="text-2xl font-bold sm:text-3xl">¿Eres profesional en Florida?</h2>
            <p className="mt-1.5 text-white/80">Tu espacio está aparte: perfil, solicitudes, clientes y redes en un solo panel.</p>
          </div>
        </div>
        <Link href="/para-profesionales" className="inline-flex min-h-14 w-fit shrink-0 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-7 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#a90016]">
          Ver el espacio profesional <ArrowRight aria-hidden size={18} />
        </Link>
      </div>
    </section>
  );
}
