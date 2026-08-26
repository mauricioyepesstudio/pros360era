/**
 * Milestone 04C — typed event interface only. No provider is connected, no
 * event table exists (platform_events remains out of scope), and no
 * component in this milestone calls anything here yet. This is the
 * documented contract a future analytics integration would implement —
 * defining it now keeps event names/payloads intentional instead of
 * ad hoc once wiring actually happens.
 */
export const opportunityAnalyticsEvents = [
  "opportunity_viewed",
  "opportunity_marked_contacted",
  "opportunity_completed",
  "opportunity_declined",
  "opportunity_expired_viewed",
  "opportunity_rematch_started",
] as const;
export type OpportunityAnalyticsEvent = (typeof opportunityAnalyticsEvents)[number];

export type OpportunityAnalyticsPayload = {
  opportunity_viewed: { opportunityId: string; effectiveStatus: string };
  opportunity_marked_contacted: { opportunityId: string };
  opportunity_completed: { opportunityId: string };
  opportunity_declined: { opportunityId: string; declinedBy: string; reason: string };
  opportunity_expired_viewed: { opportunityId: string };
  opportunity_rematch_started: { opportunityId: string };
};

export type TrackOpportunityEvent = <Event extends OpportunityAnalyticsEvent>(
  event: Event,
  payload: OpportunityAnalyticsPayload[Event],
) => void;
