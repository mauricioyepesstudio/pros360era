/**
 * EVOLUSA Growth Engine: cross-industry capability catalog.
 * These are PRODUCT CONFIGURATIONS, not proof of installed automations,
 * active vendors, licensing or delivered business outcomes.
 * Resource Living and other businesses NEVER share accounts or lead data.
 */
export type GrowthCapabilityId =
  | "public-profile"
  | "lead-intake"
  | "client-crm"
  | "follow-up"
  | "content-planning"
  | "booking"
  | "industry-workflow"
  | "revenue-attribution";

export type GrowthCapability = {
  id: GrowthCapabilityId;
  name: string;
  readiness: "pilot" | "planned";
  detail: string;
};

export const growthCapabilities: readonly GrowthCapability[] = [
  { id: "public-profile", name: "Presencia y perfil profesional", readiness: "pilot", detail: "Perfil público, servicios y enlaces reales de contacto." },
  { id: "lead-intake", name: "Captación de solicitudes", readiness: "pilot", detail: "Solicitudes de clientes con rutas y consentimiento explícitos." },
  { id: "client-crm", name: "ARM / CRM", readiness: "pilot", detail: "Seguimiento separado para cada propietario, sin mezclar clientes." },
  { id: "follow-up", name: "Seguimiento comercial", readiness: "planned", detail: "Recordatorios, responsable y próxima acción con registros verificables." },
  { id: "content-planning", name: "Contenido y redes", readiness: "pilot", detail: "Planificación y conexiones propias; publicación solo con permisos válidos." },
  { id: "booking", name: "Agenda y citas", readiness: "pilot", detail: "Enlace a agendas habilitadas; no equivale a reservas confirmadas." },
  { id: "industry-workflow", name: "Flujos por industria", readiness: "planned", detail: "Herramientas adaptadas a los procesos y requisitos de cada sector." },
  { id: "revenue-attribution", name: "Atribución de ingresos", readiness: "planned", detail: "Ingresos y costos únicamente cuando exista evidencia verificable." },
];

export type GrowthMarket = {
  id: string;
  name: string;
  audience: string;
  examples: readonly string[];
  partnerStatus: "pilot" | "recruiting";
  regulatoryNote?: string;
};

export const growthMarkets: readonly GrowthMarket[] = [
  {
    id: "marketing",
    name: "Marketing y empresas",
    audience: "Emprendedores, agencias y negocios locales",
    examples: ["Branding y diseño", "Sitios web", "Publicidad", "Automatización de ventas"],
    partnerStatus: "pilot",
  },
  {
    id: "notary",
    name: "Notaría y documentación",
    audience: "Personas, familias y compañías",
    examples: ["Notarizaciones", "Documentos", "Citas", "Coordinación documental"],
    partnerStatus: "pilot",
    regulatoryNote: "Los servicios notariales no equivalen a asesoría legal.",
  },
  {
    id: "finance",
    name: "Finanzas y operaciones",
    audience: "Profesionales independientes y empresas",
    examples: ["Análisis financiero", "Control de gastos", "Operaciones", "Reportes"],
    partnerStatus: "pilot",
    regulatoryNote: "Servicios regulados o asesoría de inversiones solo mediante profesionales habilitados.",
  },
  {
    id: "immigration",
    name: "Inmigración y visas",
    audience: "Personas, familias y negocios",
    examples: ["Organización documental", "Visas", "Traducciones", "Orientación a servicios"],
    partnerStatus: "pilot",
    regulatoryNote: "Asesoría legal migratoria únicamente por abogados o representantes acreditados autorizados.",
  },
  {
    id: "real-estate",
    name: "Bienes raíces e inversiones",
    audience: "Compradores, vendedores y propietarios",
    examples: ["Compra y venta", "Alquileres", "Administración", "Inversiones inmobiliarias"],
    partnerStatus: "recruiting",
    regulatoryNote: "Transacciones, representación y referidos sujetos a licencias y normas aplicables.",
  },
  {
    id: "home-services",
    name: "Construcción y mejoras",
    audience: "Contratistas y empresas de servicios al hogar",
    examples: ["Reformas", "Piscinas", "Cocinas", "Mantenimiento"],
    partnerStatus: "recruiting",
    regulatoryNote: "Las operaciones de otras empresas no se integran ni comparten datos sin acuerdos y permisos.",
  },
  {
    id: "vip-transport",
    name: "Transporte VIP y concierge",
    audience: "Viajeros, ejecutivos y organizadores",
    examples: ["Traslados", "Chofer privado", "Eventos", "Coordinación"],
    partnerStatus: "recruiting",
    regulatoryNote: "Operación solo mediante proveedores y vehículos con permisos y cobertura aplicables.",
  },
  {
    id: "translation",
    name: "Traducción e interpretación",
    audience: "Familias, profesionales y empresas",
    examples: ["Traducción", "Interpretación", "Documentos", "Reuniones"],
    partnerStatus: "recruiting",
  },
  {
    id: "relocation",
    name: "Relocation y servicios personales",
    audience: "Personas que se establecen en Estados Unidos",
    examples: ["Mudanzas", "Vivienda", "Educación", "Coordinación de servicios"],
    partnerStatus: "recruiting",
  },
  {
    id: "insurance",
    name: "Seguros y protección",
    audience: "Familias, profesionales y empresas",
    examples: ["Seguro médico", "Autos", "Vivienda", "Negocios"],
    partnerStatus: "recruiting",
    regulatoryNote: "Cotización y venta de seguros mediante agentes o entidades autorizadas.",
  },
];

/** No tenant, account, profile or recipient IDs belong in this shared catalog. */
export function growthMarketById(id: string): GrowthMarket | undefined {
  return growthMarkets.find((market) => market.id === id);
}

export function buildGrowthInquiryUrl(marketId: string, whatsapp: string): string | null {
  const market = growthMarketById(marketId);
  if (!market || !/^https:\/\/wa\.me\/[1-9]\d{7,14}$/.test(whatsapp)) return null;
  const message = `Hola EvolUSA. Quiero información sobre Growth Engine para el sector: ${market.name}. ¿Cómo puedo solicitar una evaluación comercial?`;
  return `${whatsapp}?text=${encodeURIComponent(message)}`;
}
