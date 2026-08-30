import Link from "next/link";
import { MapPin, Video } from "lucide-react";
import VerifiedBadge from "@/components/professional/VerifiedBadge";
import type { OpportunityProfessionalSummary as OpportunityProfessionalSummaryType } from "@/data/opportunities/types";

const consultationLabels = {
  VIRTUAL: "Consulta virtual",
  IN_PERSON: "Consulta presencial",
  BOTH: "Consulta virtual o presencial",
} as const;

export default function OpportunityProfessionalSummary({
  professional,
  heading = "Profesional asignado",
}: {
  professional: OpportunityProfessionalSummaryType;
  heading?: string;
}) {
  const location = [professional.city, professional.state].filter(Boolean).join(", ");

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--sky-surface)] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{heading}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Link
          href={`/profesionales/${professional.slug}`}
          className="text-lg font-bold text-[var(--brand-navy)] hover:text-[var(--brand-blue)]"
        >
          {professional.displayName}
        </Link>
        <VerifiedBadge verified={professional.identityVerified} />
      </div>
      {professional.headline && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{professional.headline}</p>}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
        {location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden size={14} />
            {location}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Video aria-hidden size={14} />
          {consultationLabels[professional.consultationMode]}
        </span>
      </div>
    </div>
  );
}
