"use client";

import { useId, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getVerificationType, getVerificationDisclosure } from "@/data/professional/verification-types";

/**
 * Renders EVOLUSA's identity-verified badge — nothing else. There is no
 * "unverified"/pending/rejected visual state: those are internal
 * professional_verifications states (see 0006_evolusa_verified_v1.sql) that
 * must never reach the public UI, so `verified === false` renders null
 * rather than any placeholder, warning, or empty state.
 */
export default function VerifiedBadge({ verified }: { verified: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  if (!verified) return null;

  const type = getVerificationType("IDENTITY_VERIFIED");
  const disclosure = getVerificationDisclosure("IDENTITY_VERIFIED");
  if (!type || !disclosure) return null;

  return (
    <span className="inline-block align-middle">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((prev) => !prev)}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-white/25 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-blue-on-dark)]"
      >
        <CheckCircle2 aria-hidden size={14} className="shrink-0 text-[var(--brand-blue-on-dark)]" />
        {type.label}
      </button>
      <p
        id={panelId}
        hidden={!expanded}
        className="mt-2 max-w-[min(22rem,80vw)] text-xs leading-5 text-white/70"
      >
        {disclosure}
      </p>
    </span>
  );
}
