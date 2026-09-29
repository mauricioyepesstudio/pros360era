import { redirect } from "next/navigation";

export default function ProfessionalSignupPage() {
  // Redirect to main signup with professional invite parameter
  // The main signup will handle the flow and redirect to professional-setup after auth
  redirect("/signup?professional_invite=true&invite_email=laura@1migration.com");
}
