import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crecimiento Automático | EVOLUSA",
  description:
    "Sistema automático de publicación, análisis y captura de leads para profesionales.",
};

export default function GrowthAutomationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
