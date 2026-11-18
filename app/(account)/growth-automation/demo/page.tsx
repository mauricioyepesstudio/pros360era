import { redirect } from "next/navigation";

// La presentación anterior de Growth Automation mostraba ingresos de ejemplo
// ($5,000+, 70% del revenue, "+$2K"…). Las reglas de EVOLUSA prohíben cifras
// prometidas y el modelo 70/30 sigue en pausa hasta consultar al asesor, así que
// esta ruta lleva al hub actual, que ya explica el piloto sin prometer resultados.
export default function GrowthAutomationDemoPage() {
  redirect("/growth-automation");
}
