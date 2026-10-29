// Private marketing context, separate from the reviewed professional-service category.
// Selecting an activity never grants credentials, approval, matching, or publishing rights.
export const businessActivities = [
  {id:"marketing",label:"Diseño, marketing y comunicación",topic:"preparar la marca y la presencia digital de tu negocio",headline:"Una marca que explica lo que haces"},
  {id:"operations",label:"Operaciones y administración",topic:"organizar los procesos y el seguimiento de tu negocio",headline:"Ordena el siguiente paso de tu negocio"},
  {id:"real-estate",label:"Bienes raíces / Real estate",topic:"preparar preguntas y prioridades antes de visitar una propiedad",headline:"Antes de visitar una propiedad"},
  {id:"paralegal",label:"Paralegal y apoyo documental",topic:"organizar documentos y preguntas antes de una consulta",headline:"Prepara tu consulta documental"},
  {id:"auto-sales",label:"Venta de vehículos",topic:"comparar vehículos, condiciones y necesidades antes de decidir",headline:"Antes de elegir tu próximo vehículo"},
  {id:"notary",label:"Servicios notariales",topic:"confirmar requisitos e identificar documentos antes de una cita notarial",headline:"Prepara tu cita notarial"},
  {id:"legal",label:"Abogacía y servicios legales",topic:"organizar antecedentes y preguntas para una consulta con un abogado",headline:"Preguntas para tu consulta legal"},
  {id:"licensing",label:"Licencias y permisos",topic:"identificar el trámite y consultar sus requisitos oficiales",headline:"Organiza tus preguntas sobre licencias"},
  {id:"accounting",label:"Contabilidad y bookkeeping",topic:"organizar registros y preguntas para tu profesional contable",headline:"Ordena tus documentos contables"},
  {id:"other",label:"Otra actividad",topic:"preparar tu próximo proyecto y confirmar su alcance",headline:"Prepara tu próximo proyecto"},
] as const;
export type BusinessActivityId=(typeof businessActivities)[number]["id"];
export function businessActivity(id:string){return businessActivities.find(activity=>activity.id===id);}
