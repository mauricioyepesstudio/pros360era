import Link from "next/link";
import { ExternalLink, Globe, MapPin, Video } from "lucide-react";
import VerifiedBadge from "@/components/professional/VerifiedBadge";
import type { OpportunityProfessionalSummary as OpportunityProfessionalSummaryType } from "@/data/opportunities/types";
import type { ProfessionalProfilePublic } from "@/data/professional/types";
import { socialLinkPlatformLabels, socialLinkPlatforms } from "@/data/professional/types";
import { safeBookingHref } from "@/lib/opportunities/booking";
import { safeHttpUrl, safeSocialLinks } from "@/lib/professional/links";
import EvolusaIsotype from "@/components/brand/EvolusaIsotype";

const consultationLabels = {
  VIRTUAL: "Consulta virtual",
  IN_PERSON: "Consulta presencial",
  BOTH: "Consulta virtual o presencial",
} as const;

/**
 * 2026-09-11: this is the card a member actually sees once a professional
 * is routed to them — previously name/headline/location/a booking button
 * only. `publicProfile`, when present, is the same professional_profiles_
 * public row /profesionales/[slug] renders (photo, bio, portfolio, website,
 * social links — migration 0015), fetched by
 * lib/opportunities/persistence.ts#getMyOpportunities via the professional's
 * own slug. It is optional and independently null-safe: the card still
 * renders the original thin summary correctly if publicProfile is absent
 * (e.g. called from the pre-routing consent step, components/opportunities/
 * start/OpportunityConsentStep.tsx, which intentionally keeps using the
 * thin RPC summary only — see this milestone's notes on why that earlier,
 * pre-consent moment is out of scope for this enrichment).
 */
export default function OpportunityProfessionalSummary({
  professional,
  publicProfile,
  heading = "Profesional asignado",
}: {
  professional: OpportunityProfessionalSummaryType;
  publicProfile?: ProfessionalProfilePublic | null;
  heading?: string;
}) {
  const location = [professional.city, professional.state].filter(Boolean).join(", ");
  const bookingHref = safeBookingHref(professional.bookingUrl);
  const photoHref = safeHttpUrl(publicProfile?.photoUrl);
  const portfolioHref = safeHttpUrl(publicProfile?.portfolioUrl);
  const websiteHref = safeHttpUrl(publicProfile?.websiteUrl);
  const socialLinks = safeSocialLinks(publicProfile?.socialLinks);
  const hasLinks = Boolean(portfolioHref || websiteHref || Object.keys(socialLinks).length > 0);

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--sky-surface)] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{heading}</p>
      <div className="mt-3 flex items-start gap-4">
        {publicProfile && (
          <span
            aria-hidden
            className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-[var(--border)]"
          >
            {photoHref ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary external hostname, owner-supplied, never allow-listable in next.config.ts.
              <img src={photoHref} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <EvolusaIsotype size="app" />
            )}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/profesionales/${professional.slug}`}
              className="text-lg font-bold text-[var(--brand-navy)] hover:text-[var(--brand-blue)]"
            >
              {professional.displayName}
            </Link>
            <VerifiedBadge verified={professional.identityVerified} />
          </div>
          {professional.headline && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{professional.headline}</p>}
        </div>
      </div>

      {publicProfile?.bio && <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">{publicProfile.bio}</p>}

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

      {hasLinks && (
        <div className="mt-3 flex flex-wrap gap-2">
          {portfolioHref && (
            <a
              href={portfolioHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-navy)] hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
            >
              <ExternalLink aria-hidden size={13} />
              Portafolio
            </a>
          )}
          {websiteHref && (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-navy)] hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
            >
              <Globe aria-hidden size={13} />
              Sitio web
            </a>
          )}
          {socialLinkPlatforms.map(
            (platform) =>
              socialLinks[platform] && (
                <a
                  key={platform}
                  href={socialLinks[platform]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-navy)] hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
                >
                  <ExternalLink aria-hidden size={13} />
                  {socialLinkPlatformLabels[platform]}
                </a>
              ),
          )}
        </div>
      )}

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
