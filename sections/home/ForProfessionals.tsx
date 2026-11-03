import { ArrowRight, CalendarCheck, LayoutDashboard, UsersRound } from "lucide-react";
import Container from "@/components/ui/Container";
import Link from "next/link";

/**
 * "Para profesionales" — only professional copy (owner, 3-nov): EVOLUSA
 * runs the professional's digital work and, because the audience is a
 * defined niche, brings them requests from people who already look for
 * their service.
 *
 * Copy rules: no promised number of clients or income; paying never changes
 * ranking or approval (regla 3 del repo); "perfil aprobado", never
 * "verificado".
 */
const benefits = [
  { icon: LayoutDashboard, title: "Tu perfil y tus redes en un solo panel", body: "Tu perfil profesional, Instagram y LinkedIn conectados y manejados desde EVOLUSA." },
  { icon: CalendarCheck, title: "Tu contenido, planeado y publicado", body: "Planeamos tus publicaciones de la semana y salen en tus redes a la hora indicada." },
  { icon: UsersRound, title: "Solicitudes de tu nicho", body: "Hispanos en Florida que ya buscan tu servicio te escriben desde EVOLUSA." },
] as const;

export default function ForProfessionals() {
  return (
    <section id="para-profesionales" aria-labelledby="para-pro-title" className="scroll-mt-24 bg-[var(--role-pro)] py-20 text-white sm:py-24">
      <Container>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/85">Si eres profesional</p>
        <h2 id="para-pro-title" className="mt-3 max-w-3xl text-balance text-3xl font-extrabold leading-tight sm:text-5xl">
          Tu trabajo digital, administrado. Y clientes de tu nicho.
        </h2>

        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-[var(--radius-lg)] bg-white/10 p-6 ring-1 ring-white/15">
              <Icon aria-hidden size={24} />
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-white/85">{body}</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-3xl text-sm leading-6 text-white/85">
          Hoy recibimos profesionales de marketing, operaciones de negocio, notaría y preparación documental migratoria en Florida. Revisamos cada perfil antes de publicarlo como perfil aprobado. No prometemos un número de clientes, y ningún pago cambia tu posición ni tu aprobación.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/aplicar-profesional" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-base font-bold text-[var(--role-pro)] transition hover:-translate-y-0.5 hover:bg-[var(--role-pro-soft)]">
            Aplicar como profesional
            <ArrowRight aria-hidden className="ml-2" size={18} />
          </Link>
          <Link href="/login?next=%2Fdashboard%2Fprofessional" className="inline-flex min-h-11 items-center text-sm font-bold underline underline-offset-4">
            Ya tengo cuenta
          </Link>
        </div>
      </Container>
    </section>
  );
}
