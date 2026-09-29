import { AlertCircle, CheckCircle2, Camera, Music, Play } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/account/PageHeader";

export default function ConnectPage() {
  const platforms = [
    {
      name: "Instagram",
      icon: Camera,
      slug: "instagram",
      description:
        "Conecta tu cuenta @username para publicación automática y analytics",
      status: "ready",
    },
    {
      name: "TikTok",
      icon: Music,
      slug: "tiktok",
      description:
        "Sincroniza tu TikTok para automatizar publicaciones y engagement",
      status: "coming",
    },
    {
      name: "YouTube",
      icon: Play,
      slug: "youtube",
      description: "Conecta YouTube para análisis de shorts y community posts",
      status: "coming",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Paso 1"
        title="Conecta tus redes sociales"
        description="Autentica tus cuentas de forma segura. Los datos se encriptan y solo nosotros publicamos con tu autorización."
      />

      {/* Security Note */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex gap-3">
          <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-bold text-green-900">Conexión segura</p>
            <p className="text-sm text-green-700">
              Usamos OAuth oficial de cada plataforma. Tú mantienes control total
              y puedes desconectar en cualquier momento.
            </p>
          </div>
        </div>
      </div>

      {/* Platforms */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--brand-navy)]">
          Redes disponibles
        </h2>

        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isReady = platform.status === "ready";

          return (
            <div
              key={platform.slug}
              className="rounded-lg border border-[var(--border)] bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <Icon className="text-[var(--brand-blue)]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--brand-navy)]">
                      {platform.name}
                    </h3>
                    <p className="text-sm text-[var(--muted)]">
                      {platform.description}
                    </p>
                  </div>
                </div>

                {isReady ? (
                  <a
                    href={`/api/growth-automation/auth?platform=${platform.slug}`}
                    className="rounded-lg bg-[var(--brand-blue)] px-4 py-2 font-bold text-white hover:bg-[var(--brand-navy)] transition-colors inline-block"
                  >
                    Conectar ahora
                  </a>
                ) : (
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600">
                      Próximamente
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* What We Can Access */}
      <section className="rounded-lg bg-blue-50 p-6">
        <h3 className="font-bold text-[var(--brand-navy)]">
          ¿Qué información usamos?
        </h3>
        <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
          <li>✓ Publicar contenido en tu nombre</li>
          <li>✓ Leer comentarios y engagement</li>
          <li>✓ Ver estadísticas y métricas</li>
          <li>✓ NO: Accedemos a mensajes privados</li>
          <li>✓ NO: Vemos tus datos personales sensibles</li>
        </ul>
      </section>

      {/* Next Steps */}
      <section className="rounded-lg border border-[var(--border)] bg-white p-6">
        <h3 className="font-bold text-[var(--brand-navy)]">Después de conectar</h3>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="font-bold text-[var(--brand-blue)]">1.</span>
            <span>El sistema trae tus datos actuales (seguidores, posts recientes)</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-[var(--brand-blue)]">2.</span>
            <span>Ves un dashboard con métricas en vivo</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-[var(--brand-blue)]">3.</span>
            <span>
              Mañana: sistema comienza publicación automática de contenido optimizado
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-[var(--brand-blue)]">4.</span>
            <span>Leads calificados llegan a tu WhatsApp automáticamente</span>
          </li>
        </ol>
      </section>

      {/* CTA */}
      <div className="flex gap-4">
        <Link
          href="/growth-automation"
          className="rounded-lg border border-[var(--border)] px-6 py-3 font-bold text-[var(--brand-navy)] hover:bg-gray-50 transition-colors"
        >
          ← Volver atrás
        </Link>
      </div>
    </div>
  );
}
