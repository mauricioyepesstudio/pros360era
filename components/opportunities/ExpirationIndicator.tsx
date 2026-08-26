import { Clock } from "lucide-react";
import type { OpportunityStatus } from "@/data/opportunities/types";
import { getExpirationLabel } from "@/lib/opportunities/lifecycle";

/**
 * Renders nothing once there's no expiration framing to show (see
 * getExpirationLabel — only meaningful while status is still raw ROUTED).
 * Never a countdown timer that ticks client-side: a static day-count is
 * sufficient and avoids implying more precision than a 7-day window needs.
 */
export default function ExpirationIndicator({ status, expiresAt }: { status: OpportunityStatus; expiresAt: string | null }) {
  const label = getExpirationLabel(status, expiresAt);
  if (!label) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
      <Clock aria-hidden size={14} />
      {label}
    </span>
  );
}
