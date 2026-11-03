import { ArrowRight, Briefcase, FileText, Megaphone, Stamp } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import Container from "@/components/ui/Container";
import Link from "next/link";

/**
 * "Para ti" — only what a person looking for help needs to read (owner,
 * 3-nov: the home mixed member and professional copy and felt heavy).
 * Professional copy lives only in ForProfessionals.tsx.
 *
 * Copy rules: EVOLUSA guides and connects; the professional does the work.
 * No promised outcomes, no "verificado" (only "perfil aprobado"), and no
 * legal/immigration/notarial advice from EVOLUSA itself.
 */
const steps = [
  { title: "Cuéntanos tu situación", body: "Unas preguntas cortas sobre dónde estás y qué quieres lograr." },
  { title: "Ves tus pasos en orden", body: "Qué hacer ahora, qué sigue después y qué documentos reunir." },
  { title: "Un profesional te acompaña", body: "En cada paso que lo necesite, eliges un profesional con perfil aprobado." },
] as const;

const categories = [
  { icon: FileText, title: "Documentos para trámites migratorios", body: "Profesionales que te ayudan a reunir y preparar tus documentos." },
  { icon: Stamp, title: "Notaría", body: "Notarios públicos de Florida para notarizar tus documentos." },
  { icon: Briefcase, title: "Abrir y operar tu negocio", body: "Ayuda para organizar las operaciones de tu negocio." },
  { icon: Megaphone, title: "Marketing para tu negocio", body: "Presencia en internet, redes y Google para que te encuentren." },
] as const;

export default function ForMembers() {
  return (
    <section id="como-funciona" aria-labelledby="para-ti-title" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <Container>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--role-member)]">Si buscas ayuda</p>
        <h2 id="para-ti-title" className="mt-3 max-w-3xl text-balance text-3xl font-extrabold leading-tight text-[var(--brand-navy)] sm:text-5xl">
          Tus trámites en EE. UU., paso a paso y con un profesional a tu lado.
        </h2>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-[var(--radius-lg)] bg-[var(--role-member-soft)] p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-[var(--role-member)] text-sm font-extrabold text-white">{index + 1}</span>
              <h3 className="mt-4 text-lg font-bold text-[var(--brand-navy)]">{step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{step.body}</p>
            </li>
          ))}
        </ol>

        <h3 className="mt-16 text-xl font-bold text-[var(--brand-navy)]">Qué encuentras en EVOLUSA</h3>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-[var(--radius-lg)] border border-[var(--border)] p-5">
              <Icon aria-hidden className="text-[var(--role-member)]" size={22} />
              <p className="mt-3 font-bold text-[var(--brand-navy)]">{title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
          EVOLUSA te orienta y te conecta. No da asesoría legal, migratoria, fiscal ni notarial: cada servicio lo presta el profesional que eliges.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ButtonLink href="/onboarding" variant="member" className="min-h-12 px-7 text-base">
            Crear mi plan
            <ArrowRight aria-hidden className="ml-2" size={18} />
          </ButtonLink>
          <Link href="/profesionales" className="inline-flex min-h-11 items-center text-sm font-bold text-[var(--role-member-strong)] underline underline-offset-4">
            Ver profesionales
          </Link>
        </div>
      </Container>
    </section>
  );
}
