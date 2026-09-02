import Link from "next/link";
import { Rocket, ShieldCheck, Sparkles, Video } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";
import Container from "@/components/ui/Container";
import Heading from "@/components/ui/Heading";
import ProfessionalApplicationForm from "@/components/professional-applications/ProfessionalApplicationForm";

const pillars = [
  {
    icon: Rocket,
    title: "Clientes calificados, no leads fríos",
    body: "Cada persona que te llega ya pasó por un perfil de necesidad, elegibilidad y ubicación — llega sabiendo qué busca.",
  },
  {
    icon: Video,
    title: "Primer contacto rápido",
    body: "Un cliente calificado agenda una videollamada contigo directamente — sin intermediarios ni esperas largas.",
  },
  {
    icon: ShieldCheck,
    title: "Confianza real, no comprada",
    body: "En EVOLUSA la confianza nunca se vende — nadie paga por aparecer primero. Se gana con verificación real.",
  },
];

export default function AplicarProfesionalPage() {
  return (
    <main className="min-h-screen bg-[var(--warm-canvas)] pb-24">
      <div className="border-b border-[var(--border)] bg-[var(--brand-navy)] py-16 text-white">
        <Container>
          <Link href="/">
            <BrandMark theme="dark" size="md" />
          </Link>
          <div className="mt-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-blue-on-dark)]">Invitación a profesionales</p>
            <h1 className="mt-3 text-balance text-4xl font-extrabold leading-tight sm:text-5xl">Estamos construyendo el camino de miles de personas en Estados Unidos — y buscamos profesionales reales para recorrerlo con ellas.</h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-slate-200">
              EVOLUSA conecta a inmigrantes hispanohablantes con profesionales verificados, en el momento exacto en que los necesitan. Estamos empezando ahora — y quien entra primero, crece con la plataforma, no después de ella.
            </p>
          </div>
        </Container>
      </div>

      <Container className="mt-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <Heading as="h2" eyebrow="Por qué ahora">
              Una oportunidad real de negocio y de crecimiento profesional
            </Heading>
            <p className="mt-4 max-w-lg leading-7 text-[var(--muted)]">
              No te pedimos que pagues por estar aquí. Tampoco te prometemos resultados garantizados — te prometemos un sistema honesto: tú apareces cuando de verdad puedes ayudar, y solo pagas por la conexión cuando ya es real.
            </p>

            <div className="mt-8 space-y-6">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex gap-4">
                  <pillar.icon aria-hidden className="mt-1 flex-none text-[var(--brand-blue)]" size={26} />
                  <div>
                    <h3 className="font-bold text-[var(--brand-navy)]">{pillar.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{pillar.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
              <div className="flex items-center gap-2 text-[var(--brand-coral)]">
                <Sparkles aria-hidden size={18} />
                <p className="text-xs font-bold uppercase tracking-wider">Todavía en construcción</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Somos honestos: estamos en una etapa temprana. Marketing y Operaciones de Negocio ya conectan clientes reales hoy. Notaría está activándose. Impuestos y Legal/Inmigración vienen después — si aplicas ahí, tu información queda guardada y te contactamos apenas esté lista tu categoría.
              </p>
            </div>
          </div>

          <div>
            <ProfessionalApplicationForm />
          </div>
        </div>
      </Container>
    </main>
  );
}
