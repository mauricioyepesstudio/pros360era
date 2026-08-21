import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type RadioOption = { value: string; label: string; description?: string };
type RadioGroupProps = { legend: string; name: string; options: readonly RadioOption[]; value?: string; className?: string; onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"] };

export default function RadioGroup({ legend, name, options, value, className, onChange }: RadioGroupProps) {
  return <fieldset className={cn("space-y-3", className)}><legend className="mb-3 font-semibold text-[var(--brand-navy)]">{legend}</legend>{options.map((option) => <label key={option.value} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4 has-[:checked]:border-[var(--brand-gold-strong)] has-[:checked]:bg-amber-50"><input className="mt-1 size-4 accent-[var(--brand-gold-strong)]" type="radio" name={name} value={option.value} checked={value === option.value} onChange={onChange} /><span><span className="block font-medium text-[var(--foreground)]">{option.label}</span>{option.description && <span className="mt-1 block text-sm text-[var(--muted)]">{option.description}</span>}</span></label>)}</fieldset>;
}
