import { requireProfessionalArea } from "@/lib/account/role-gate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crecimiento Automático | EVOLUSA",
  description:
    "Sistema automático de publicación, análisis y captura de leads para profesionales.",
};

export default async function GrowthAutomationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProfessionalArea();
  return <>{children}</>;
}
