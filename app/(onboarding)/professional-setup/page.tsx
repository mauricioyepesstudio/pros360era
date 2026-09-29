"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: SetupStep[] = [
  {
    id: 1,
    title: "Datos de tu Empresa",
    description: "Información básica de 1MIGRATION",
    icon: "🏢",
  },
  {
    id: 2,
    title: "Conectar Instagram",
    description: "Autoriza acceso a tu cuenta",
    icon: "📸",
  },
  {
    id: 3,
    title: "Revisar Permisos",
    description: "Verificación de credenciales",
    icon: "✓",
  },
  {
    id: 4,
    title: "¡Listo!",
    description: "Comienza a automatizar tu crecimiento",
    icon: "🎉",
  },
];

export default function ProfessionalSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState({
    displayName: "1MIGRATION",
    category: "BUSINESS_MARKETING",
    consultationMode: "BOTH",
    city: "",
    phone: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const instagramCallback = searchParams?.get("instagram_connected");
    if (instagramCallback === "true") {
      setCurrentStep(3);
    }
  }, [searchParams]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/professional/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al guardar datos");
      }

      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleInstagramConnect = () => {
    const state = Buffer.from(
      JSON.stringify({ platform: "instagram", redirect: "professional-setup" })
    ).toString("base64");

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || "",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/growth-automation/callback`,
      scope: "instagram_basic,instagram_graph_user_profile,pages_show_list,instagram_graph_business_create_content",
      response_type: "code",
      state,
    });

    window.location.href = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  };

  const handleCompleteSetup = async () => {
    setLoading(true);
    try {
      // Redirigir al dashboard profesional
      router.push("/dashboard/professional");
    } catch (err) {
      setError("Error al completar setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-blue-200/50 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link href="/">
            <BrandMark size="sm" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Steps Progress */}
        <div className="mb-12 flex justify-between">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full font-bold transition-all ${
                  currentStep >= step.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 size={24} />
                ) : (
                  step.icon
                )}
              </div>
              <p className="text-xs font-semibold text-gray-700">{step.title}</p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Business Data */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Configura tu Negocio
                </h2>
                <p className="mt-2 text-gray-600">
                  Información básica de 1MIGRATION
                </p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de tu Empresa
                  </label>
                  <input
                    type="text"
                    value={businessData.displayName}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        displayName: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={businessData.city}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        city: e.target.value,
                      })
                    }
                    placeholder="Ej: Miami, New York"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={businessData.phone}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Instagram Connection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Conecta tu Instagram
                </h2>
                <p className="mt-2 text-gray-600">
                  Necesitamos acceso a tu cuenta para publicar contenido automático
                </p>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-pink-50 to-purple-50 p-6">
                <p className="mb-4 text-sm text-gray-700">
                  El sistema publicará automáticamente:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ 2-3 posts diarios optimizados</li>
                  <li>✓ Respuestas automáticas con IA</li>
                  <li>✓ Análisis de engagement en vivo</li>
                  <li>✓ Captura automática de leads</li>
                </ul>
              </div>

              <button
                onClick={handleInstagramConnect}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    📸 Conectar Instagram
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                Serás redirigido a Instagram para autorizar. Puedes regresar aquí después.
              </p>
            </div>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  ¡Instagram Conectado!
                </h2>
                <p className="mt-2 text-gray-600">
                  Tu cuenta está lista para comenzar
                </p>
              </div>

              <div className="space-y-3 rounded-lg bg-green-50 p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600" size={24} />
                  <span className="text-gray-700">
                    Datos de empresa guardados
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600" size={24} />
                  <span className="text-gray-700">Instagram conectado</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-600" size={24} />
                  <span className="text-gray-700">
                    Permisos de publicación verificados
                  </span>
                </div>
              </div>

              <button
                onClick={handleCompleteSetup}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    Ir a mi Dashboard
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="text-center">
              <div className="mb-6 text-6xl">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900">
                ¡Felicidades, Laura!
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Tu cuenta de 1MIGRATION está lista para crecer automáticamente
              </p>
              <p className="mt-6 text-sm text-gray-500">
                En los próximos 30 días verás:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>📈 +200 nuevos seguidores</li>
                <li>💬 18-20 leads calificados</li>
                <li>💰 $5,000+ en ingresos (70% para ti)</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
