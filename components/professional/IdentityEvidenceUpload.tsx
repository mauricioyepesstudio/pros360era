"use client";

import { useState, useTransition } from "react";
import { submitIdentityEvidenceAction } from "@/app/(account)/identity-actions";
import Button from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { evidenceBucket, evidencePathFor, ownStatusLabels, type OwnIdentityStatus } from "@/lib/professional/identity-verification";
import { getVerificationDisclosure } from "@/data/professional/verification-types";

/** El navegador sube el archivo a su propia carpeta privada; el servidor lo registra. */
export default function IdentityEvidenceUpload({ status }: { status: OwnIdentityStatus }) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();
  const canSubmit = current !== "VERIFIED";

  function send() {
    if (!file) return;
    startTransition(async () => {
      setMessage("");
      const supabase = createSupabaseBrowserClient();
      const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
      if (!supabase || !data.user) { setMessage("Inicia sesión de nuevo para enviar tu documento."); return; }
      const target = evidencePathFor(data.user.id, file);
      if (!target.ok) { setMessage(target.message); return; }
      const upload = await supabase.storage.from(evidenceBucket).upload(target.path, file, { contentType: file.type });
      if (upload.error) { setMessage("No se pudo subir el archivo. Inténtalo de nuevo."); return; }
      const result = await submitIdentityEvidenceAction(target.path);
      setMessage(result.message);
      if (result.saved) { setCurrent("PENDING"); setFile(null); }
    });
  }

  return (
    <section id="identidad" className="border-t border-[var(--border)] pt-6">
      <h2 className="text-lg font-bold text-[var(--brand-navy)]">Verifica tu identidad</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Tu perfil aprobado puede mostrar la insignia «Identidad verificada». Sube una foto clara de tu
        identificación oficial con foto (licencia de conducir, ID estatal o pasaporte) con el mismo nombre de tu cuenta.
        Solo el equipo de EVOLUSA la revisa y la borramos al terminar la revisión.
      </p>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{getVerificationDisclosure("IDENTITY_VERIFIED")}</p>
      <p className="mt-3 text-sm font-semibold text-[var(--brand-navy)]" role="status">{ownStatusLabels[current]}</p>
      {canSubmit && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            aria-label="Documento de identidad"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-sm text-[var(--brand-navy)]"
          />
          <Button type="button" disabled={!file || pending} onClick={send}>
            {pending ? "Enviando…" : current === "PENDING" ? "Reemplazar documento" : "Enviar documento"}
          </Button>
        </div>
      )}
      {message && <p className="mt-3 text-sm text-[var(--brand-navy)]">{message}</p>}
    </section>
  );
}
