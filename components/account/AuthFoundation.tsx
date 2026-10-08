"use client";
import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { safeReturnPath, professionalWorkspacePath } from "@/lib/auth/return-path";
import { initialCallDestination, authEntryHref } from "@/lib/initial-call/auth-intent";
import { initializeProfessionalDraftAction } from "@/app/(account)/dashboard/professional/actions";
import { getAuthReadiness } from "@/lib/auth/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { confirmationCooldownSeconds, confirmationRequestMessage, isExistingSignup, isUnconfirmedEmail, normalizeAuthEmail, requestConfirmation, translateAuthError } from "@/lib/auth/confirmation";

export default function AuthFoundation({ mode }: { mode: "login" | "signup" }) {
  const readiness = getAuthReadiness();
  const signup = mode === "signup";
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeReturnPath(searchParams.get("next"));
  const professional = next === professionalWorkspacePath;

  const [initialCall, setInitialCall] = useState(searchParams.get("initialCall") === "1");
  const callQuery = initialCall ? "&initialCall=1" : "";
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
    router.push(initialCallDestination(next, initialCall));
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
        <Link className="mt-5 inline-block font-bold text-[var(--brand-blue)] underline" href={authEntryHref("login", next, initialCall)}>Ya tengo cuenta o ya confirmé: entrar</Link>
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
      <div className="mt-5 space-y-2 rounded-xl bg-[var(--sky-surface)] p-4 text-sm">
        <p className="font-bold">Una cuenta, dos formas de participar</p>
        <div className="flex flex-wrap gap-4"><Link href={`/${mode}?next=%2Fdashboard${callQuery}`} className="font-bold underline">Soy usuario</Link><Link href={`/${mode}?next=%2Fdashboard%2Fprofessional${callQuery}`} className="font-bold underline">Soy profesional</Link></div>
        <p className="leading-6 text-[var(--muted)]">{professional ? "Si ya tienes acceso profesional habilitado, entrarás a tu panel. Si tu solicitud sigue en revisión, podrás preparar tu presentación privada." : "Como usuario, continúas tu camino. Si también ofreces servicios, entra por Soy profesional para preparar tu presentación."}</p>
      </div>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
        {signup && <label className="flex items-start gap-3 rounded-xl bg-[var(--sky-surface)] p-4 text-sm"><input type="checkbox" checked={initialCall} onChange={event => setInitialCall(event.target.checked)} className="mt-1 size-5 shrink-0"/><span><strong className="block">Quiero una videollamada inicial</strong>Después de entrar, podrás elegir el tema y tu disponibilidad. Este paso es opcional y no reserva una cita.</span></label>}
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
        <Link className="font-bold text-[var(--brand-blue)]" href={authEntryHref(signup ? "login" : "signup", next, initialCall)}>
          {signup ? "Entrar" : "Crear cuenta"}
        </Link>
      </p>
    </div>
  );
}
