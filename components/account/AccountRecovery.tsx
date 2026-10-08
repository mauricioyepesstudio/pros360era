"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AccountRecovery({ email, title = "No pudimos verificar tu tipo de cuenta" }: { email: string | null; title?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function changeAccount() {
    setBusy(true);
    try {
      const { error } = await createSupabaseBrowserClient().auth.signOut();
      if (error) throw error;
      router.replace("/login?next=%2Fdashboard%2Fprofessional");
      router.refresh();
    } catch {
      setError("No pudimos cerrar la sesión. Intenta de nuevo.");
      setBusy(false);
    }
  }
  return <main className="mx-auto max-w-xl space-y-5 px-5 py-16">
    <h1 className="text-2xl font-bold text-[var(--brand-navy)]">{title}</h1>
    {email && <p className="break-all">Sesión: {email}</p>}
    <p>Reintenta para abrir el espacio que corresponde a tu cuenta. Si ingresaste con otro correo, cambia de cuenta.</p>
    {error && <p role="alert">{error}</p>}
    <div className="flex flex-wrap gap-4">
      <button className="min-h-11 rounded-full bg-[var(--brand-blue)] px-5 font-bold text-white" onClick={() => window.location.reload()}>Reintentar</button>
      <button className="min-h-11 rounded-full border border-[var(--brand-blue)] px-5 font-bold" disabled={busy} onClick={changeAccount}>{busy ? "Cerrando sesión…" : "Cambiar cuenta"}</button>
    </div>
  </main>;
}
