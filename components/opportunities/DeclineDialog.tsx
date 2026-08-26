"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import RadioGroup from "@/components/ui/RadioGroup";
import { declineReasonsByActor, type DeclinedBy, type DeclineReason } from "@/data/opportunities/types";
import { declineReasonLabels } from "@/data/opportunities/copy";

type DeclineDialogProps = {
  /** Which actor-scoped reason list to show — never a shared/ambiguous list. See data/opportunities/types.ts#declineReasonsByActor. */
  actor: DeclinedBy;
  onConfirm: (reason: DeclineReason) => void | Promise<void>;
};

/**
 * "OTHER" stays a fixed enum option here, same as every other reason — this
 * dialog never renders a text input, in either state, for any actor. Uses
 * Radix Dialog (already an installed, unused dependency) rather than a
 * hand-rolled modal: focus trap, Escape-to-close, aria-modal, and labelled-by
 * wiring all come from it for free.
 */
export default function DeclineDialog({ actor, onConfirm }: DeclineDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<DeclineReason | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const options = declineReasonsByActor[actor].map((value) => ({ value, label: declineReasonLabels[value] }));

  async function handleConfirm() {
    if (!reason) return;
    setSubmitting(true);
    await onConfirm(reason);
    setSubmitting(false);
    setOpen(false);
    setReason(undefined);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="min-h-11 rounded-[var(--radius-pill)] px-4 text-sm font-semibold text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--brand-navy)]">
          Declinar
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <Dialog.Content
          className="fixed inset-x-4 bottom-4 z-[70] rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-lg)] focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2"
        >
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-bold text-[var(--brand-navy)]">¿Por qué quieres declinar esta conexión?</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="Cerrar" className="rounded-full p-1 text-[var(--muted)] hover:bg-slate-100">
                <X aria-hidden size={18} />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Elige la razón que mejor describe tu situación. Esto no se envía como un mensaje directo.
          </Dialog.Description>
          <div className="mt-5">
            <RadioGroup legend="Razón" name="decline-reason" options={options} value={reason} onChange={(event) => setReason(event.target.value as DeclineReason)} />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button type="button" className="min-h-11 rounded-[var(--radius-pill)] px-4 text-sm font-semibold text-[var(--muted)] hover:bg-slate-100">
                Cancelar
              </button>
            </Dialog.Close>
            <Button type="button" variant="primary" disabled={!reason || submitting} onClick={handleConfirm}>
              {submitting ? "Enviando..." : "Confirmar"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
