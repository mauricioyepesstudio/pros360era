"use client";
import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { safeReturnPath, professionalWorkspacePath } from "@/lib/auth/return-path";
import { authEntryHref } from "@/lib/initial-call/auth-intent";
import { initializeProfessionalDraftAction } from "@/app/(account)/dashboard/professional/actions";
import { getAuthReadiness } from "@/lib/auth/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { canUseGoogleOAuth } from "@/lib/auth/provider-capability";

import { confirmationCooldownSeconds, confirmationRequestMessage, isExistingSignup, isUnconfirmedEmail, normalizeAuthEmail, requestConfirmation, translateAuthError } from "@/lib/auth/confirmation";

export default function AuthFoundation({ mode }: { mode: "login" | "signup" }) {
  const readiness = getAuthReadiness();
  const signup = mode === "signup";
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeReturnPath(searchParams.get("next"));
  const professional = next === professionalWorkspacePath;

  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    const env = getSupabaseEnv();
    if (!env) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    void canUseGoogleOAuth(env, controller.signal)
      .then(enabled => { if (!controller.signal.aborted) setGoogleEnabled(enabled); })
      .finally(() => window.clearTimeout(timeout));
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState("");

  useEffect(() => {
    if (!confirmationSent) return;
    const timer = window.setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [confirmationSent]);

  async function resendConfirmation() {
    if (resending || cooldown > 0) return;
    setResending(true); setError(null); setResendNotice("");
    try {
      const result = await requestConfirmation(createSupabaseBrowserClient().auth, email, cooldown);
      setCooldown(confirmationCooldownSeconds);
      if (result.requested) setResendNotice("Solicitud de reenvío recibida. Si tu cuenta necesita confirmación, revisa tu correo.");
      else setError(result.message);
    } catch { setError("No pudimos conectar con el servicio de cuentas. Intenta de nuevo."); }
    finally { setResending(false); }
  }

  async function enterAccount() {
    await restoreProfessionalInformation();
    // The authenticated server route owns role resolution and authorization.
    router.push(next);
    router.refresh();
  }

  async function restoreProfessionalInformation() {
    if (!professional) return;
    try {
      const raw = sessionStorage.getItem("evolusa-professional-handoff-v1");
      if (!raw) return;
      const handoff = JSON.parse(raw);
      if (handoff.email !== email.trim().toLowerCase()) return;
      const result = await initializeProfessionalDraftAction(handoff.draft);
      if (result.saved) sessionStorage.removeItem("evolusa-professional-handoff-v1");
    } catch { /* Draft handoff must not prevent successful login. */ }
  }

  async function signInWithGoogle() {
    if (!googleEnabled || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: oauthError } = await createSupabaseBrowserClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (oauthError) setError(translateAuthError(oauthError.message));
    } catch {
      setError("No pudimos iniciar sesión con Google. Inténtalo nuevamente.");
    } finally { setSubmitting(false); }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const normalizedEmail = normalizeAuthEmail(email);
      if (signup) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email: normalizedEmail, password });
        if (signUpError) {
          if (isExistingSignup(signUpError)) {
            // Never disclose account existence via the signup response — show the
            // same neutral confirmation-options state used for a new signup.
            setConfirmationSent(true);
            setCooldown(confirmationCooldownSeconds);
            return;
          }
          setError(translateAuthError(signUpError.message));
          return;
        }
        if (data.session) {
          await enterAccount();
        } else {
          setConfirmationSent(true);
          setCooldown(confirmationCooldownSeconds);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (signInError) {
          if (isUnconfirmedEmail(signInError)) { setConfirmationSent(true); setCooldown(0); return; }
          setError(translateAuthError(signInError.message));
          return;
        }
        await enterAccount();
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
          Correo usado: <strong>{normalizeAuthEmail(email)}</strong>. {confirmationRequestMessage}
        </p>
        {professional && <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Tu solicitud y tu cuenta son pasos separados. Con tu cuenta puedes preparar tu presentación privada mientras revisamos la solicitud.</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <button type="button" disabled={resending || cooldown > 0} onClick={resendConfirmation} className="mt-5 min-h-12 w-full rounded-full border border-[var(--brand-blue)] font-bold text-[var(--brand-blue)] disabled:opacity-50">{resending ? "Solicitando enlace…" : cooldown > 0 ? `Reenviar en ${cooldown} s` : "Reenviar confirmación"}</button>
        {(resending || resendNotice) && <p role="status" aria-live="polite" className="mt-3 text-sm text-[var(--muted)]">{resending ? "Solicitando otro enlace…" : resendNotice}</p>}
        <Link className="mt-5 inline-block font-bold text-[var(--brand-blue)] underline" href={authEntryHref("login", next, false)}>Ya tengo cuenta o ya confirmé: entrar</Link>
        <button type="button" onClick={() => { setConfirmationSent(false); setError(null); }} className="mt-3 block min-h-10 w-full text-sm underline">{signup ? "Corregir correo" : "Volver a entrar"}</button>
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
          ? (professional ? "Crea tu cuenta para entrar a tu espacio profesional. La aprobación de tu perfil se realiza por separado." : "Guarda tu diagnóstico y continúa tu camino personalizado.")
          : (professional ? "Entra a tu espacio profesional y revisa los próximos pasos." : "Continúa tu Roadmap y revisa tu progreso.")}
      </p>
      {signup ? <div className="mt-5 space-y-2 rounded-xl bg-[var(--sky-surface)] p-4 text-sm">
        <p className="font-bold">¿Cómo quieres empezar?</p>
        <div className="flex flex-wrap gap-4"><Link href="/signup?next=%2Fdashboard" className="font-bold underline">Busco un profesional</Link><Link href="/signup?next=%2Fdashboard%2Fprofessional" className="font-bold underline">Ofrezco servicios profesionales</Link></div>
      </div> : <p className="mt-5 text-sm leading-6 text-[var(--muted)]">Usa el correo de tu cuenta. Al entrar, iremos a tu espacio según tu perfil.</p>}
      <button type="button" onClick={signInWithGoogle} disabled={submitting || !googleEnabled} aria-describedby={!googleEnabled ? "google-status" : undefined} className="mt-6 min-h-12 w-full rounded-full border border-[var(--border)] bg-white font-bold text-[var(--brand-navy)] disabled:cursor-not-allowed disabled:opacity-60">{googleEnabled ? "Continuar con Google" : "Google · no disponible todavía"}</button>
      {!googleEnabled && <p id="google-status" className="mt-2 text-center text-xs text-[var(--muted)]">Por ahora, entra con tu correo y contraseña.</p>}
      <p className="mt-4 text-center text-sm text-[var(--muted)]">O continúa con tu correo electrónico</p>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
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
        {!signup && <Link href="/forgot-password" className="block text-right text-sm font-bold text-[var(--brand-blue)] underline">¿Olvidaste tu contraseña?</Link>}

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
        <Link className="font-bold text-[var(--brand-blue)]" href={authEntryHref(signup ? "login" : "signup", next, false)}>
          {signup ? "Entrar" : "Crear cuenta"}
        </Link>
      </p>
    </div>
  );
}
