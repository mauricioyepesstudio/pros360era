"use client";

import { useState, useTransition } from "react";
import { approveExistingProfileAction } from "@/app/(account)/actions";
import Button from "@/components/ui/Button";
import type { AdminExistingProfileRow } from "@/lib/admin/persistence";

function ExistingProfileRow({ profile }: { profile: AdminExistingProfileRow }) {
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [approved, setApproved] = useState(false);
  const [message, setMessage] = useState("");
  const reasonIsValid = reason.trim().length >= 12 && reason.trim().length <= 500;

  function approve() {
    startTransition(async () => {
      setMessage("");
      try {
        const result = await approveExistingProfileAction(profile.id, profile.category, reason);
        setMessage(result.message);
        if (result.saved) { setApproved(true); setConfirming(false); }
      } catch { setMessage("No se pudo confirmar la aprobación. Actualiza la página."); }
    });
  }

  if (approved) return null;
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
      <p className="font-bold text-[var(--brand-navy)]">{profile.displayName}</p>
      <p className="text-sm text-[var(--muted)]">{profile.email}</p>
      <div className="mt-3 grid gap-1 text-sm text-[var(--muted)] sm:grid-cols-2">
        <p><span className="font-semibold text-[var(--brand-navy)]">Categoría:</span> {profile.category}</p>
        {profile.city && <p><span className="font-semibold text-[var(--brand-navy)]">Ciudad:</span> {profile.city}</p>}
      </div>
      {profile.category === "IMMIGRATION_DOCUMENT_SUPPORT" && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-3 text-sm text-[var(--brand-navy)]">
          Aprobación manual de apoyo documental. EVOLUSA no da asesoría migratoria ni es una agencia de inmigración.
        </p>
      )}
      {confirming ? (
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold text-[var(--brand-navy)]" htmlFor={`reason-${profile.id}`}>Motivo de aprobación (mínimo 12 caracteres)</label>
          <textarea id={`reason-${profile.id}`} value={reason} maxLength={500} onChange={(event) => setReason(event.target.value)} className="min-h-24 w-full rounded-[var(--radius-md)] border border-[var(--border)] p-3 text-sm" />
          <p className="text-sm text-[var(--muted)]">¿Confirmas que deseas aprobar este perfil? La acción queda registrada con tu cuenta de administrador.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={pending || !reasonIsValid} onClick={approve}>{pending ? "Guardando…" : "Confirmar aprobación"}</Button>
            <Button type="button" variant="secondary" disabled={pending} onClick={() => setConfirming(false)}>Cancelar</Button>
          </div>
        </div>
      ) : <Button type="button" variant="secondary" className="mt-4" disabled={pending} onClick={() => setConfirming(true)}>Aprobar perfil existente</Button>}
      {message && <p className="mt-3 text-sm text-[var(--brand-navy)]" role="status">{message}</p>}
    </div>
  );
}

export default function ExistingProfilesTable({ profiles }: { profiles: AdminExistingProfileRow[] }) {
  if (profiles.length === 0) return <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-8 text-center text-[var(--muted)]">No hay perfiles sin solicitud pendientes de aprobación.</div>;
  return <div className="space-y-4">{profiles.map((profile) => <ExistingProfileRow key={profile.id} profile={profile} />)}</div>;
}
