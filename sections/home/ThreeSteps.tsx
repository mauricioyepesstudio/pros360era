import Link from "next/link";
import { ArrowRight, ClipboardCheck, Route, UserCheck } from "lucide-react";

/**
 * "Así empiezas" on brand red-strong (#c4001a keeps white text above 4.5:1).
 * Step 1 is the onboarding questionnaire the platform already has.
 */
const steps = [
  { icon: ClipboardCheck, title: "Respondes unas preguntas", body: "Dónde estás, qué quieres lograr y en qué idioma te atienden. No te pedimos números de identificación." },
  { icon: Route, title: "Ves tu camino", body: "Tu etapa, qué hacer ahora, qué sigue y qué documentos reunir." },
  { icon: UserCheck, title: "Eliges tu profesional", body: "Por zona, idioma y lo que necesitas. Le escribes directo." },
] as const;

export default function ThreeSteps() {
  return (
    <section id="como-funciona" aria-labelledby="steps-title" className="scroll-mt-20 bg-[var(--brand-red-strong)] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em]">
          <span aria-hidden className="h-[3px] w-7 rounded-full bg-white" />Así empiezas
        </p>
        <h2 id="steps-title" className="mt-3 text-balance text-4xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-5xl">Tres pasos y ya sabes qué hacer.</h2>
        <ol className="mt-14 grid gap-9 md:grid-cols-3 md:gap-0">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <li key={title} className="border-l-2 border-white/35 pl-6 md:px-8 md:first:border-l-0 md:first:pl-0">
              <span className="flex items-center gap-3.5 text-[15px] font-bold tracking-[0.14em]">
                <span aria-hidden className="grid size-[52px] place-items-center rounded-full bg-white text-[var(--brand-red-strong)]"><Icon size={24} /></span>
                PASO {index + 1}
              </span>
              <h3 className="mt-5 text-2xl font-bold">{title}</h3>
              <p className="mt-2.5 text-base leading-relaxed text-white/95">{body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/onboarding" className="inline-flex min-h-14 items-center gap-2 rounded-full bg-white px-7 font-bold text-[var(--brand-red-strong)] transition hover:-translate-y-0.5">
            Empezar las preguntas <ArrowRight aria-hidden size={18} />
          </Link>
          <span className="text-sm text-white/95">Toma unos 3 minutos</span>
        </div>
        <p className="mt-10 max-w-[84ch] text-[12.5px] leading-5 text-white/90">
          EVOLUSA te orienta y te conecta. No es bufete ni agencia de inmigración y no da asesoría legal, migratoria, fiscal ni notarial: cada servicio lo presta el profesional que eliges. No prometemos resultados.
        </p>
      </div>
    </section>
  );
}
