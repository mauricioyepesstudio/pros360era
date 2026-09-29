import { redirect } from "next/navigation";

export default function ProfessionalInvitePage() {
  // Redirect directly to signup with professional_invite parameter
  redirect("/signup?professional_invite=true");
}
