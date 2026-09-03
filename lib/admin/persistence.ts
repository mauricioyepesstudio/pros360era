import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfessionalApplicationStatus = "PENDING" | "REVIEWED" | "CONTACTED";

export type ProfessionalApplicationRow = {
  id: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string | null;
  city: string | null;
  categoryOfInterest: string;
  credentialInfo: string | null;
  bio: string | null;
  notes: string | null;
  status: ProfessionalApplicationStatus;
  reviewedAt: string | null;
};

export type AdminDashboardStats = {
  totalMembers: number;
  totalProfessionalsApproved: number;
  pendingApplications: number;
  totalOpportunities: number;
  routedOpportunities: number;
  contactedOpportunities: number;
  completedOpportunities: number;
};

/**
 * Every function here calls an ADMIN-gated SECURITY DEFINER RPC (0016) —
 * the same "the database is the authority, this file just invokes it"
 * pattern as lib/opportunities/persistence.ts. Never a direct table read;
 * professional_applications has no SELECT grant for authenticated at all.
 */
export async function getProfessionalApplications(): Promise<ProfessionalApplicationRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase.rpc("admin_list_professional_applications");

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: row.id as string,
    createdAt: row.created_at as string,
    fullName: row.full_name as string,
    email: row.email as string,
    phone: (row.phone as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    categoryOfInterest: row.category_of_interest as string,
    credentialInfo: (row.credential_info as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    status: row.status as ProfessionalApplicationStatus,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
  }));
}

export async function updateApplicationStatus(applicationId: string, status: ProfessionalApplicationStatus) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false as const, reason: "SUPABASE_NOT_CONFIGURED" as const };

  const { data, error } = await supabase.rpc("admin_update_application_status", {
    p_application_id: applicationId,
    p_status: status,
  });

  if (error) return { saved: false as const, reason: "RPC_ERROR" as const, message: error.message };
  return { saved: true as const, data };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.rpc("admin_dashboard_stats");
  const row = (data as Array<Record<string, unknown>> | null)?.[0];
  if (!row) return null;

  return {
    totalMembers: Number(row.total_members ?? 0),
    totalProfessionalsApproved: Number(row.total_professionals_approved ?? 0),
    pendingApplications: Number(row.pending_applications ?? 0),
    totalOpportunities: Number(row.total_opportunities ?? 0),
    routedOpportunities: Number(row.routed_opportunities ?? 0),
    contactedOpportunities: Number(row.contacted_opportunities ?? 0),
    completedOpportunities: Number(row.completed_opportunities ?? 0),
  };
}
