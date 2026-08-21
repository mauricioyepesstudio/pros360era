import type { RoadmapQuestion } from "./types.ts";

const yesNoUnsure = [
  { value: "yes", label: "Sí" },
  { value: "no", label: "No" },
  { value: "unsure", label: "No estoy seguro/a" },
] as const;

export const roadmapQuestions: readonly RoadmapQuestion[] = [
  { id: "timeInUs", label: "¿Hace cuánto estás en Estados Unidos?", helpText: "Puedes omitir esta información si lo prefieres.", options: [{ value: "under_6_months", label: "Menos de 6 meses" }, { value: "6_to_24_months", label: "Entre 6 meses y 2 años" }, { value: "over_24_months", label: "Más de 2 años" }, { value: "prefer_not_to_say", label: "Prefiero no decirlo" }] },
  { id: "hasBusiness", label: "¿Ya tienes un negocio en operación?", options: yesNoUnsure },
  { id: "businessRegistered", label: "¿Tu negocio ya está registrado?", options: yesNoUnsure, showWhen: (answers) => answers.hasBusiness === "yes" },
  { id: "hasEin", label: "¿Tu negocio ya tiene EIN, cuando corresponde?", options: yesNoUnsure, showWhen: (answers) => answers.hasBusiness === "yes" },
  { id: "hasBusinessBankAccount", label: "¿Tienes una cuenta bancaria separada para el negocio?", options: yesNoUnsure, showWhen: (answers) => answers.hasBusiness === "yes" },
  { id: "hasBookkeeping", label: "¿Llevas un registro organizado de ingresos y gastos?", options: yesNoUnsure, showWhen: (answers) => answers.hasBusiness === "yes" },
  { id: "needsTaxPreparation", label: "¿Necesitas encontrar apoyo para preparar impuestos?", options: yesNoUnsure, showWhen: (answers) => answers.hasBusiness === "yes" },
  { id: "hasBusinessInsurance", label: "¿Ya revisaste las necesidades de seguro de tu negocio con un proveedor apropiado?", options: yesNoUnsure, showWhen: (answers) => answers.hasBusiness === "yes" },
  { id: "hasWebsite", label: "¿Tu negocio tiene una página web activa?", options: yesNoUnsure, showWhen: (answers) => answers.hasBusiness === "yes" },
  { id: "hasGoogleBusiness", label: "¿Tienes un Google Business Profile activo?", options: yesNoUnsure, showWhen: (answers) => answers.hasBusiness === "yes" },
  { id: "getsCustomersConsistently", label: "¿Estás consiguiendo clientes de forma consistente?", options: yesNoUnsure, showWhen: (answers) => answers.hasBusiness === "yes" },
  { id: "primaryPriority", label: "¿Cuál es tu prioridad principal ahora?", options: [{ value: "settle", label: "Organizar mi nueva etapa" }, { value: "start_business", label: "Crear una empresa" }, { value: "organize_business", label: "Organizar mi negocio" }, { value: "protect_business", label: "Revisar cómo protegerlo" }, { value: "get_customers", label: "Conseguir más clientes" }, { value: "scale", label: "Preparar el siguiente nivel" }] },
];

export function getVisibleQuestions(answers: Parameters<NonNullable<RoadmapQuestion["showWhen"]>>[0]) {
  return roadmapQuestions.filter((question) => !question.showWhen || question.showWhen(answers));
}
