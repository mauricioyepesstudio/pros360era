import { Check, Circle, MoveRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ProgressStepProps = { status: "complete" | "current" | "upcoming"; title: string; description?: string; children?: ReactNode };
export default function ProgressStep({ status, title, description, children }: ProgressStepProps) {
  const Icon = status === "complete" ? Check : status === "current" ? MoveRight : Circle;
  return <li className="flex gap-4"><span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", status === "complete" && "bg-emerald-50 text-[var(--success)]", status === "current" && "bg-blue-50 text-[var(--brand-blue)]", status === "upcoming" && "bg-slate-100 text-slate-500")}><Icon aria-hidden="true" size={17} /></span><div><p className="font-semibold text-[var(--brand-navy)]">{title}</p>{description && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>}{children}</div></li>;
}
