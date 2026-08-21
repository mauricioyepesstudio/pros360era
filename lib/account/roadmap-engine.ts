import { lifeEvents } from "../../data/account/foundation.ts";
import type { Recommendation, RoadmapInput, RoadmapOutput } from "../../data/account/types.ts";

const catalog: Recommendation[] = [
  { id: "define-priority", title: "Define tu prioridad principal", description: "Elige el área que necesita atención primero para mantener tu camino manejable.", stage: "LLEGA", priority: 1, category: "GENERAL", status: "NOW", sourceType: "EVOLUSA_GUIDE", requiresProfessional: false, actionType: "COMPLETE_TASK", reason: "Da contexto al resto del Roadmap." },
  { id: "employment-checklist", title: "Organiza tu nueva etapa laboral", description: "Revisa documentos de empleo, presupuesto y beneficios que necesitas comprender.", stage: "ESTABLECETE", priority: 1, category: "WORK", status: "NOW", sourceType: "EVOLUSA_GUIDE", requiresProfessional: false, actionType: "PLAN", reason: "Seleccionaste trabajo o informaste un cambio laboral." },
  { id: "financial-basics", title: "Ordena tus finanzas básicas", description: "Crea una lista simple de ingresos, gastos recurrentes y próximos compromisos.", stage: "ESTABLECETE", priority: 2, category: "FINANCES", status: "NOW", sourceType: "EVOLUSA_GUIDE", requiresProfessional: false, actionType: "COMPLETE_TASK", reason: "Finanzas aparece entre tus necesidades." },
  { id: "official-documents", title: "Consulta la fuente oficial correspondiente", description: "Usa información gubernamental oficial para requisitos y trámites específicos.", stage: "ESTABLECETE", priority: 2, category: "DOCUMENTS", status: "UPCOMING", sourceType: "OFFICIAL", requiresProfessional: false, actionType: "READ", reason: "Seleccionaste ayuda para organizar documentos." },
  { id: "business-readiness", title: "Evalúa tu preparación para emprender", description: "Aclara oferta, cliente, operación y recursos antes de iniciar trámites.", stage: "EMPRENDE", priority: 1, category: "BUSINESS", status: "NOW", sourceType: "EVOLUSA_GUIDE", requiresProfessional: false, actionType: "PLAN", reason: "Quieres iniciar o ya operas un negocio." },
  { id: "tax-professional", title: "Identifica apoyo fiscal apropiado", description: "Prepara tus preguntas y confirma credenciales, alcance y jurisdicción del proveedor.", stage: "PROTEGETE", priority: 1, category: "TAX", status: "UPCOMING", sourceType: "PROFESSIONAL", requiresProfessional: true, actionType: "CONTACT_PROFESSIONAL", reason: "Seleccionaste impuestos como necesidad o evento." },
  { id: "marketing-foundation", title: "Fortalece tu presencia comercial", description: "Revisa marca, sitio web, presencia local y seguimiento de oportunidades.", stage: "CRECE", priority: 2, category: "MARKETING", status: "UPCOMING", sourceType: "EVOLUSA_GUIDE", requiresProfessional: false, actionType: "PLAN", reason: "Quieres hacer crecer tu negocio." },
  { id: "future-review", title: "Revisa tu progreso y actualiza cambios", description: "Vuelve a evaluar necesidades y eventos para recibir el siguiente paso.", stage: "EVOLUCIONA", priority: 4, category: "GENERAL", status: "LATER", sourceType: "EVOLUSA_GUIDE", requiresProfessional: false, actionType: "PLAN", reason: "Mantiene el ciclo de progreso activo." },
];

export function generateAccountRoadmap(input: RoadmapInput): RoadmapOutput {
  const eventCategories = lifeEvents.filter((event) => input.lifeEventIds.includes(event.id)).map((event) => event.category);
  const categories = new Set([...input.selectedNeeds, ...input.goals.map((goal) => goal.category), ...eventCategories]);
  const relevant = catalog.filter((item) => item.category === "GENERAL" || categories.has(item.category) || (item.category === "BUSINESS" && input.businessStatus !== "NONE") || (item.category === "WORK" && input.employment === "EMPLOYED"));
  const completedIds = new Set(input.completedTaskIds);
  const normalized = relevant.map((item) => completedIds.has(item.id) ? { ...item, status: "COMPLETED" as const } : item);
  const by = (status: Recommendation["status"]) => normalized.filter((item) => item.status === status).sort((a, b) => a.priority - b.priority);
  return { completed: by("COMPLETED"), now: by("NOW").slice(0, 3), upcoming: by("UPCOMING").slice(0, 4), later: by("LATER") };
}
