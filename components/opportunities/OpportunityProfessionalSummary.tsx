import Link from "next/link";
import { MapPin, Video } from "lucide-react";
import VerifiedBadge from "@/components/professional/VerifiedBadge";
import type { OpportunityProfessionalSummary as OpportunityProfessionalSummaryType } from "@/data/opportunities/types";
import { safeBookingHref } from "@/lib/opportunities/booking";

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
  const bookingHref = safeBookingHref(professional.bookingUrl);

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
      {bookingHref && (
        <a
          href={bookingHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand-blue)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--brand-navy)]"
        >
          <Video aria-hidden size={16} />
          Agendar videollamada
        </a>
      )}
    </div>
  );
}
