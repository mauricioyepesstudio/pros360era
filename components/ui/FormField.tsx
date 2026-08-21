import type { ReactNode } from "react";

type FormFieldProps = { id: string; label: string; children: ReactNode; hint?: string; error?: string; required?: boolean };

export default function FormField({ id, label, children, hint, error, required }: FormFieldProps) {
  const descriptionId = hint || error ? `${id}-description` : undefined;
  return <div className="space-y-2"><label className="block font-semibold text-[var(--brand-navy)]" htmlFor={id}>{label}{required && <span aria-hidden="true" className="ml-1 text-[var(--danger)]">*</span>}</label>{children}{descriptionId && <p id={descriptionId} className={error ? "text-sm text-[var(--danger)]" : "text-sm text-[var(--muted)]"}>{error ?? hint}</p>}</div>;
}
