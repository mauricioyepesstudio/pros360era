"use client";
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAuthReadiness } from "@/lib/auth/config";
import { recoveryCallbackUrl } from "@/lib/auth/email-link";
import { translateAuthError } from "@/lib/auth/confirmation";

export default function ForgotPasswordPage() {
  return <Suspense><ForgotPasswordForm /></Suspense>;
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const ready = getAuthReadiness().configured;
  const expired = useSearchParams().get("error") === "expired";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true); setError("");
    try {
      const { error: authError } = await createSupabaseBrowserClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: recoveryCallbackUrl(window.location.origin),
      });
      if (authError) { setError(translateAuthError(`${authError.code ?? ""} ${authError.message}`)); return; }
      setSent(true);
    } catch {
      setError("No fue posible procesar la solicitud. Inténtalo nuevamente.");
    } finally { setPending(false); }
  }
  return <main className="min-h-screen bg-[var(--warm-canvas)] px-5 py-16">
    <div className="mx-auto max-w-md rounded-3xl border border-[var(--border)] bg-white p-8 shadow-lg">
      <Link href="/login" className="font-semibold text-[var(--brand-blue)]">← Volver a entrar</Link>
      <h1 className="mt-8 text-3xl font-extrabold text-[var(--brand-navy)]">Recuperar contraseña</h1>
      {sent ? <p role="status" className="mt-5 leading-7">Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña. Revisa también spam.</p> :
        <form onSubmit={submit} className="mt-6 space-y-5">
          {expired && <p role="alert" className="text-sm text-red-700">El enlace expiró o ya se usó. Pide uno nuevo y ábrelo en este mismo navegador.</p>}
          <label className="block text-sm font-semibold">Correo electrónico
            <input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border p-3" />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {!ready && <p role="alert" className="text-sm text-red-700">El servicio de autenticación aún no está configurado.</p>}
          <button disabled={pending || !ready} className="min-h-12 w-full rounded-full bg-[var(--brand-coral)] font-bold text-white disabled:opacity-50">{pending ? "Enviando…" : "Enviar enlace de recuperación"}</button>
        </form>}
    </div>
  </main>;
}
