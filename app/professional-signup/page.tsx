import { redirect } from "next/navigation";
export default function ProfessionalSignupPage() {
 redirect("/signup?next=%2Fdashboard%2Fprofessional");
}
