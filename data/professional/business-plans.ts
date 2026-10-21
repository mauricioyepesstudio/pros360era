import {services} from "../services/services.ts";
type ServiceId=(typeof services)[number]["id"];
export type BusinessPlan={id:string;name:string;purpose:string;serviceIds:readonly ServiceId[];deliverables:readonly string[];activation:string;priceMode:"quote"};
export const businessPlans=[
 {id:"presencia",name:"Presencia",purpose:"Presenta tu negocio y facilita el primer contacto.",serviceIds:["brand-starter","website-presence","google-business-support","whatsapp-business-support"],deliverables:["Base de marca, perfil y página web según el alcance acordado.","Configuración de WhatsApp Business: información, catálogo de servicios, saludo y respuestas rápidas.","Revisión de elegibilidad y acompañamiento con Google Business Profile; presencia web para negocios no elegibles."],activation:"Servicio asistido. Configuración y accesos se acuerdan para cada negocio.",priceMode:"quote"},
 {id:"contenido-seguimiento",name:"Contenido y seguimiento",purpose:"Mantén una presencia consistente y organiza cada consulta.",serviceIds:["brand-starter","website-presence","whatsapp-business-support","crm-foundation"],deliverables:["Presencia más administración de contenido y canales seleccionados.","Planner, propuestas gráficas y guiones para reels con revisión humana; cantidad y formatos definidos en la cotización.","Preparación de campañas para Lives: tema, invitados, piezas y recordatorios aprobados.","Organización de contactos, etapas de seguimiento y reporte de actividad medida."],activation:"Gestión mensual con volumen, canales, revisiones y tiempos de respuesta pactados. La conexión de Lives con BELONG está pendiente.",priceMode:"quote"},
 {id:"automatizacion-captacion",name:"Automatización y captación",purpose:"Conecta atención, formularios y seguimiento comercial.",serviceIds:["whatsapp-business-support","crm-foundation","google-business-support","growth-automation"],deliverables:["Contenido y seguimiento más implementación de flujos de atención y registro de interesados.","Asistente para preguntas frecuentes aprobadas, calificación inicial y transferencia a una persona.","Integración de WhatsApp Business Platform, formularios, agenda, alertas y CRM, previa validación técnica por negocio.","Configuración y medición de campañas y del recorrido consulta → contacto → cita; sin garantizar leads ni ventas."],activation:"Implementación por evaluar. Las respuestas automáticas y conexiones externas no están activadas al contratar o visitar esta página.",priceMode:"quote"},
] as const satisfies readonly BusinessPlan[];
export const businessCostLayers=[
 {id:"implementation",title:"Implementación inicial",detail:"Diagnóstico, configuración, diseño, conexiones y prueba de entrega. Precio fijo según alcance."},
 {id:"management",title:"Administración mensual",detail:"Canales, contenido, soporte, revisiones y reportes con límites acordados. Mejoras fuera del alcance se cotizan."},
 {id:"external",title:"Consumos y servicios externos",detail:"Mensajería de Meta, proveedor si se utiliza, dominio, hosting, correo profesional y presupuesto publicitario se detallan antes de activar. Sin consumos ilimitados."},
] as const;
export const businessPlanSources=[
 {label:"WhatsApp Business: herramientas para negocios",href:"https://business.whatsapp.com/products/business-app"},
 {label:"WhatsApp Business Platform: tarifas vigentes",href:"https://business.whatsapp.com/products/platform-pricing"},
 {label:"Google Business Profile: elegibilidad",href:"https://support.google.com/business/answer/13763036?hl=es"},
] as const;

export function businessPlanQuoteUrl(base:string,plan:BusinessPlan):string{
 if(!/^https:\/\/wa\.me\/\d{8,15}$/.test(base))throw Error("Invalid business contact");
 return base+"?text="+encodeURIComponent("Hola, quiero una propuesta del plan "+plan.name+" ("+plan.id+") para mi negocio.");
}
