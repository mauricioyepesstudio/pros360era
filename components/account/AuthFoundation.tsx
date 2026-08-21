"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { getAuthReadiness } from "@/lib/auth/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function translateAuthError(message: string): string {
  const known: [pattern: RegExp, spanish: string][] = [
    [/invalid login credentials/i, "Correo o contraseña incorrectos."],
    [/user already registered/i, "Ya existe una cuenta con este correo. Intenta entrar."],
    [/password should be at least/i, "La contraseña debe tener al menos 6 caracteres."],
    [/email not confirmed/i, "Confirma tu correo antes de entrar. Revisa tu bandeja de entrada."],
    [/email address ".*" is invalid|unable to validate email/i, "Ese correo no parece válido."],
    [/email rate limit exceeded/i, "Se alcanzó el límite temporal de envíos de correo. Intenta de nuevo en unos minutos."],
  ];
  const match = known.find(([pattern]) => pattern.test(message));
  return match?.[1] ?? "No pudimos completar la solicitud. Intenta de nuevo en unos minutos.";
}

export default function AuthFoundation({ mode }: { mode: "login" | "signup" }) {
  const readiness = getAuthReadiness();
  const signup = mode === "signup";
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (signup) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError(translateAuthError(signUpError.message));
          return;
        }
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setConfirmationSent(true);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(translateAuthError(signInError.message));
          return;
        }
        router.push(next);
        router.refresh();
      }
    } catch {
      setError("No pudimos conectar con el servicio de cuentas. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!readiness.configured) {
    return (
      <div className="mx-auto w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-[var(--brand-blue)]">
          <LockKeyhole aria-hidden />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold text-[var(--brand-navy)]">
          {signup ? "Crea tu cuenta gratis" : "Entra a tu cuenta"}
        </h1>
        <div className="mt-6 rounded-[var(--radius-md)] border border-blue-200 bg-blue-50 p-4">
          <p className="font-bold text-[var(--brand-navy)]">Autenticación pendiente de configuración</p>
          <p className="mt-2 text-xs text-slate-600">Faltan: {readiness.missing.join(", ")}</p>
        </div>
      </div>
    );
  }

  if (confirmationSent) {
    return (
      <div className="mx-auto w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 text-center shadow-[var(--shadow-md)] sm:p-8">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-50 text-[var(--brand-blue)]">
          <LockKeyhole aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold text-[var(--brand-navy)]">Revisa tu correo</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Te enviamos un enlace de confirmación a <strong>{email}</strong>. Confírmalo para activar tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
      <span className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-[var(--brand-blue)]">
        <LockKeyhole aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold text-[var(--brand-navy)]">
        {signup ? "Crea tu cuenta gratis" : "Entra a tu cuenta"}
      </h1>
      <p className="mt-3 leading-7 text-[var(--muted)]">
        {signup
          ? "Guarda tu diagnóstico y continúa tu camino personalizado."
          : "Continúa tu Roadmap y revisa tu progreso."}
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <label className="block text-sm font-semibold text-[var(--brand-navy)]">
          Correo electrónico
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4"
            placeholder="tu@correo.com"
          />
        </label>
        <label className="block text-sm font-semibold text-[var(--brand-navy)]">
          Contraseña
          <input
            required
            minLength={6}
            type="password"
            autoComplete={signup ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4"
            placeholder="••••••••"
          />
        </label>
        {error && (
          <p role="alert" className="rounded-[var(--radius-md)] bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="min-h-12 w-full rounded-full bg-[var(--brand-coral)] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Un momento..." : signup ? "Crear cuenta" : "Entrar"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {signup ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
        <Link className="font-bold text-[var(--brand-blue)]" href={signup ? "/login" : "/signup"}>
          {signup ? "Entrar" : "Crear cuenta"}
        </Link>
      </p>
    </div>
  );
}
