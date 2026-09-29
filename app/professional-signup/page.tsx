"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, Lock } from "lucide-react";
import BrandMark from "@/components/evolusa/BrandMark";

export default function ProfessionalSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/professional-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al registrarse");
      }

      const result = await response.json();
      router.push(result.redirectTo || "/onboarding/professional-setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="border-b border-blue-200/50 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-md px-6 py-4">
          <Link href="/">
            <BrandMark size="sm" />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center px-6">
        <div className="w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenida a 1MIGRATION Pro
            </h1>
            <p className="mt-2 text-gray-600">
              Crea tu cuenta para comenzar a automatizar tu crecimiento
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-lg">
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="laura@1migration.com"
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative mt-1">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 8 caracteres
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    Crear Cuenta
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="font-semibold text-blue-600">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </div>

          <div className="space-y-3 rounded-lg bg-blue-50 p-6">
            <p className="text-sm font-semibold text-gray-900">
              Con tu cuenta profesional obtendrás:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Dashboard profesional 1MIGRATION</li>
              <li>✓ Automatización de contenido Instagram</li>
              <li>✓ Captura automática de leads</li>
              <li>✓ Análisis de competencia</li>
              <li>✓ Ingresos 70% para ti</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
