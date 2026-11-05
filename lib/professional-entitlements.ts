import { PROFESSIONAL_BILLING_ENABLED, type ProfessionalPlanId } from "@/lib/professional-plans";

export type ProfessionalEntitlement = "public_profile" | "lead_inbox" | "crm" | "planner" | "basic_automations" | "agents" | "advanced_workflows" | "reports" | "integrations";

const entitlements: Record<ProfessionalPlanId, readonly ProfessionalEntitlement[]> = {
  pilot: ["public_profile", "lead_inbox"],
  starter: ["public_profile", "lead_inbox"],
  professional: ["public_profile", "lead_inbox", "crm", "planner", "basic_automations"],
  business: ["public_profile", "lead_inbox", "crm", "planner", "basic_automations", "agents", "advanced_workflows", "reports", "integrations"],
};

export type ProfessionalSubscriptionSnapshot = {
  plan: ProfessionalPlanId;
  status: "pilot" | "active" | "past_due" | "canceled" | "expired";
  pilotEndsAt?: string | null;
  billingExempt?: boolean;
};

/** Use only with a server-verified subscription loaded from the database.
 * Never trust a plan or status supplied by the browser or user metadata.
 * In pilot mode, paid-only capabilities are NOT granted by selecting a plan.
 */
export function hasProfessionalEntitlement(
  snapshot: ProfessionalSubscriptionSnapshot | null,
  entitlement: ProfessionalEntitlement,
  now = new Date(),
): boolean {
  if (!snapshot) return false;
  if (!PROFESSIONAL_BILLING_ENABLED) {
    if (snapshot.status !== "pilot" || snapshot.plan !== "pilot") return false;
    if (!snapshot.billingExempt && snapshot.pilotEndsAt && new Date(snapshot.pilotEndsAt).getTime() <= now.getTime()) return false;
    return entitlements.pilot.includes(entitlement);
  }
  if (snapshot.status !== "active" && snapshot.status !== "pilot") return false;
  if (snapshot.status === "pilot" && snapshot.pilotEndsAt && new Date(snapshot.pilotEndsAt).getTime() <= now.getTime()) return false;
  return entitlements[snapshot.plan].includes(entitlement);
}
