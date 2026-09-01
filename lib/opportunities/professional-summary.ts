import type { ConsultationMode } from "../../data/professional/types.ts";
import type { OpportunityProfessionalSummary } from "../../data/opportunities/types.ts";

export type OpportunityProfessionalRpcRow = {
  opportunity_id: string;
  professional_slug: string;
  display_name: string;
  category: string;
  headline: string | null;
  state: string | null;
  city: string | null;
  languages: string[] | null;
  consultation_mode: ConsultationMode;
  is_accepting_clients: boolean;
  identity_verified: boolean;
  booking_url: string | null;
};

/** Explicit allowlist mapper: extra RPC columns can never pass through by object spreading. */
export function mapOpportunityProfessionalSummary(row: OpportunityProfessionalRpcRow): OpportunityProfessionalSummary {
  return {
    opportunityId: row.opportunity_id,
    slug: row.professional_slug,
    displayName: row.display_name,
    category: row.category,
    headline: row.headline,
    state: row.state,
    city: row.city,
    languages: row.languages ?? [],
    consultationMode: row.consultation_mode,
    isAcceptingClients: row.is_accepting_clients,
    identityVerified: row.identity_verified,
    bookingUrl: row.booking_url,
  };
}
