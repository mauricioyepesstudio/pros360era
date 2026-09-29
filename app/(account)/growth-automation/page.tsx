import { Zap, BarChart3, MessageSquare, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/account/PageHeader";
import { getCurrentProfile } from "@/lib/account/persistence";
import { getService } from "@/data/services/services";

export default async function GrowthAutomationPage() {
  const profile = await getCurrentProfile();
  const service = getService("growth-automation");

  if (!service) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Error"
          title="Servicio no disponible"
          description="El módulo de crecimiento automático no está disponible en este momento."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="🚀 Nuevo"
        title="Automatiza tu crecimiento"
        description="Publicación automática, leads calificados, análisis en vivo. Ganamos juntos: 70% tú, 30% nosotros."
      />

      {/* Hero Section */}
      <section className="rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-navy)] p-8 text-white">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Tu sistema completo en 4 pasos</h2>
            <p className="mt-2 text-blue-100">
              Desde conectar redes hasta ver ingresos reales, en 30 días.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { num: 1, title: "Conecta", desc: "Instagram, TikTok, YouTube" },
                { num: 2, title: "Publica", desc: "2-3 posts automáticos diarios" },
                { num: 3, title: "Automatiza", desc: "IA responde, califica leads" },
                { num: 4, title: "Cobra", desc: "70% de cada cliente nuevo" },
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-bold">
                      {step.num}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold">{step.title}</p>
                    <p className="text-sm text-blue-100">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/growth-automation/demo"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white text-[var(--brand-navy)] px-6 py-3 font-semibold hover:bg-blue-50 transition-colors"
            >
              Ver Demo Interactivo
              <ArrowRight size={18} />
            </div>
          </div>

          <div className="rounded-lg bg-white/10 p-6 backdrop-blur">
            <h3 className="font-bold">Proyección Mes 1</h3>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-blue-100">Seguidores nuevos</span>
                <strong>+86-200</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Leads calificados</span>
                <strong>18-20</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Servicios tramitados</span>
                <strong>3-5</strong>
              </div>
              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between">
                  <span className="font-bold">Ingresos generados</span>
                  <strong className="text-2xl">$5,000+</strong>
                </div>
                <p className="mt-2 text-sm text-blue-100">Tú cobras: $3,500+ (70%)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-[var(--brand-navy)]">Lo que incluye</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Publicación automática",
              desc: "2-3 posts diarios optimizados para tu nicho",
            },
            {
              icon: MessageSquare,
              title: "Respuestas IA",
              desc: "Contesta comentarios automáticamente",
            },
            {
              icon: BarChart3,
              title: "Analytics en vivo",
              desc: "Métricas actualizadas cada 6 horas",
            },
            {
              icon: DollarSign,
              title: "Ingresos transparentes",
              desc: "Ve exactamente cuánto ganas (70/30 split)",
            },
            {
              icon: MessageSquare,
              title: "Calificación de leads",
              desc: "WhatsApp automation → solo leads reales",
            },
            {
              icon: BarChart3,
              title: "Análisis de competencia",
              desc: "Detecta tendencias, optimiza contenido",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="rounded-lg border border-[var(--border)] bg-white p-6"
              >
                <Icon className="text-[var(--brand-blue)]" size={28} />
                <h3 className="mt-4 font-bold text-[var(--brand-navy)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-lg border-2 border-[var(--brand-blue)] bg-blue-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-[var(--brand-navy)]">
          ¿Listo para crecer automático?
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          Conecta tus redes en 5 minutos. El sistema empieza a trabajar mañana.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/growth-automation/connect"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-blue)] px-6 py-3 font-bold text-white hover:bg-[var(--brand-navy)] transition-colors"
          >
            Conectar mis redes
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/growth-automation/content"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--brand-blue)] px-6 py-3 font-bold text-[var(--brand-blue)] hover:bg-blue-50 transition-colors"
          >
            Generar contenido IA
          </Link>
        </div>
      </section>
    </div>
  );
}
