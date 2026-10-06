import { requireProfessionalArea } from "@/lib/account/role-gate";
export const metadata = {
  title: "CRM | EVOLUSA",
  description: "Gestión de leads, conversaciones y pipeline de ventas",
};

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  await requireProfessionalArea();
  return <>{children}</>;
}
