import { requireProfessionalArea } from "@/lib/account/role-gate";
import LeadFollowup from "@/components/crm/LeadFollowup";
export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  await requireProfessionalArea();
  return <LeadFollowup id={(await params).id} />;
}
