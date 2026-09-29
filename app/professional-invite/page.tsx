import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";

export default function ProfessionalInvitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="border-b border-blue-200/50 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link href="/">
            <BrandMark size="sm" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Bienvenido 1MIGRATION
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Laura, te invitamos a automatizar tu crecimiento
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Left side - Info */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900">
                ¿Qué obtendrás?
              </h2>
              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <CheckCircle2 className="mt-1 flex-shrink-0 text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900">Dashboard Profesional</p>
                    <p className="text-sm text-gray-600">Gestión completa de tu marca 1MIGRATION</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="mt-1 flex-shrink-0 text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900">Automatización Instagram</p>
                    <p className="text-sm text-gray-600">2-3 posts diarios optimizados automáticamente</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="mt-1 flex-shrink-0 text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900">Captura de Leads</p>
                    <p className="text-sm text-gray-600">18-20 leads calificados en 30 días</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="mt-1 flex-shrink-0 text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900">Ingresos 70%</p>
                    <p className="text-sm text-gray-600">$3,500+ en tu primer mes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              <p className="text-sm font-semibold text-gray-900">En 30 días esperamos:</p>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>✓ +200 nuevos seguidores</p>
                <p>✓ 18-20 leads calificados</p>
                <p>✓ $5,000+ en ingresos</p>
                <p>✓ 70% para ti = $3,500+</p>
              </div>
            </div>
          </div>

          {/* Right side - CTA */}
          <div className="flex flex-col justify-center">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900">
                ¿Listo para comenzar?
              </h2>
              <p className="mt-4 text-gray-600">
                Sigue estos 4 pasos para activar tu cuenta:
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Crear Cuenta</p>
                    <p className="text-sm text-gray-600">Con tu email</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Datos Empresa</p>
                    <p className="text-sm text-gray-600">1MIGRATION info</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Conectar Instagram</p>
                    <p className="text-sm text-gray-600">OAuth autorización</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">¡Listo!</p>
                    <p className="text-sm text-gray-600">Ver dashboard y propuestas</p>
                  </div>
                </div>
              </div>

              <Link
                href="/signup"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-700 transition-colors"
              >
                Crear Mi Cuenta
                <ArrowRight size={20} />
              </Link>

              <p className="mt-6 text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="font-semibold text-blue-600">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
