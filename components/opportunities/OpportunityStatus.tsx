import { CheckCircle2, Clock, MessageCircle, Sparkles, XCircle } from "lucide-react";
import type { EffectiveOpportunityStatus } from "@/data/opportunities/types";
import { statusLabels } from "@/data/opportunities/copy";
import { cn } from "@/lib/cn";

const iconByStatus: Record<Exclude<EffectiveOpportunityStatus, "CREATED">, typeof CheckCircle2> = {
  ROUTED: Sparkles,
  CONTACTED: MessageCircle,
  COMPLETED: CheckCircle2,
  DECLINED: XCircle,
  EXPIRED: Clock,
};

const toneByStatus: Record<Exclude<EffectiveOpportunityStatus, "CREATED">, string> = {
  ROUTED: "bg-blue-50 text-[var(--brand-blue)]",
  CONTACTED: "bg-amber-50 text-[var(--warning)]",
  COMPLETED: "bg-emerald-50 text-[var(--success)]",
  DECLINED: "bg-slate-100 text-slate-600",
  EXPIRED: "bg-orange-50 text-orange-800",
};

/**
 * Status is always icon + text together — never color alone (accessibility
 * requirement carried over from Milestone 04C's design brief). Renders
 * nothing meaningful for CREATED since no surface in this milestone ever
 * shows a bare-CREATED opportunity (see getMyOpportunities' status filter).
 */
export default function OpportunityStatus({ status, className }: { status: EffectiveOpportunityStatus; className?: string }) {
  if (status === "CREATED") return null;
  const Icon = iconByStatus[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold", toneByStatus[status], className)}>
      <Icon aria-hidden size={14} />
      {statusLabels[status]}
    </span>
  );
}
