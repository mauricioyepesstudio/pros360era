"use client";

import { useState, useTransition } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { beginGoogleAccountLink } from "@/lib/account/google-linking";

type Props = { state: { userId: string; email: string | null; googleEmails: string[] } | null };

export default function GoogleAccountLink({ state }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  function linkGoogle() {
    if (!state || pending) return;
    setMessage("");
    startTransition(async () => {
      try {
        const client = createSupabaseBrowserClient();
        const result = await beginGoogleAccountLink(client.auth, state.userId, window.location.origin);
        if (!result.ok) { setMessage(result.message); return; }
        window.location.assign(result.url);
      } catch { setMessage("No pudimos iniciar la vinculación. Recarga el perfil e inténtalo de nuevo."); }
    });
  }
  return <Card>
    <section id="mi-acceso" aria-labelledby="google-link-heading" className="space-y-4">
      <h2 id="google-link-heading" className="text-lg font-bold text-[var(--brand-navy)]">Acceso a tu cuenta</h2>
      {state ? <>
        <p className="text-sm">Correo principal: <strong>{state.email ?? "No disponible"}</strong></p>
        <div className="text-sm"><p className="font-semibold">Cuentas Google vinculadas</p>
          {state.googleEmails.length ? <ul className="mt-1 list-inside list-disc">{state.googleEmails.map((email, index) => <li key={`${email}-${index}`}>{email}</li>)}</ul> : <p>Todavía no tienes un Google vinculado.</p>}
        </div>
        <p className="text-sm leading-6 text-[var(--muted)]">Para usar otro Google, entra primero con la cuenta que ya abre tu perfil. Después pulsa el botón y elige el nuevo Google. Vincularlo mantiene tu perfil, planner y clientes en la misma cuenta de EVOLUSA.</p>
        <p className="text-sm leading-6 text-[var(--muted)]">Vincular otro Google no cambia el correo principal ni elimina el acceso anterior. Al volver, comprueba que el nuevo correo aparezca en esta lista antes de probarlo para entrar.</p>
        <Button type="button" disabled={pending} onClick={linkGoogle}>{pending ? "Abriendo Google…" : "Vincular otra cuenta de Google"}</Button>
      </> : <p role="alert">No pudimos confirmar tu cuenta. Recarga el perfil antes de vincular Google.</p>}
      {message ? <p role="status" className="text-sm text-[var(--danger)]">{message}</p> : null}
    </section>
  </Card>;
}
