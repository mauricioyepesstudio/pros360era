import { serializeCareer } from "../../lib/professional/career.ts";
import type { ProfessionalCareer } from "../../lib/professional/career.ts";
import type { ConsultationMode, ProfessionalSocialLinks } from "./types.ts";

/**
 * A "prepared kit" is everything the team readies for a professional before
 * their first login: the profile content that gets written into their own
 * professional_profiles row at provisioning time, plus the welcome material
 * (creatives, links to review) shown only inside their panel.
 *
 * The kit is attached to the account through auth app_metadata.prepared_kit,
 * which only the service role can set (unlike user_metadata, a user cannot
 * write it to themselves), so nobody can claim another person's kit.
 *
 * Everything here comes from the professional's own CV. Nothing is invented:
 * the employer, credentials in progress and session prices stay marked as
 * pending until the professional confirms them.
 *
 * Relative imports only (no "@/") so tests can load it under `node --test`.
 */

export type CreativeFormat = "1x1" | "4x5" | "9x16";

export type CreativeConcept = {
  id: string;
  title: string;
  topic: string;
  /** READY_FOR_REVIEW: the professional approves it before any use. NEEDS_CONFIRMATION: contains data only they can confirm. */
  status: "READY_FOR_REVIEW" | "NEEDS_CONFIRMATION";
  note?: string;
};

export type PreparedKit = {
  id: string;
  firstName: string;
  /**
   * Default category when the admin doesn't pass one. NOTARY (REGULATED) is
   * only reachable through a kit the owner approved: the profile stays
   * unapproved and unmatched until a NOTARY_COMMISSION_VERIFIED row exists.
   */
  category: "BUSINESS_MARKETING" | "BUSINESS_OPERATIONS" | "NOTARY";
  profile: {
    displayName: string;
    headline: string;
    career: ProfessionalCareer;
    city: string;
    state: string;
    languages: string[];
    consultationMode: ConsultationMode;
    websiteUrl: string | null;
    socialLinks: ProfessionalSocialLinks;
  };
  project: { name: string; url: string; description: string } | null;
  creatives: { basePath: string; formats: readonly CreativeFormat[]; concepts: CreativeConcept[] };
  /** Shown as a checklist in the welcome card; only what the professional must still do or confirm. */
  pendingConfirmations: string[];
};

export const creativeFormatLabels: Record<CreativeFormat, string> = {
  "1x1": "Cuadrado 1:1",
  "4x5": "Vertical 4:5",
  "9x16": "Story 9:16",
};

const miguelAcosta: PreparedKit = {
  id: "miguel-acosta",
  firstName: "Miguel",
  // Finanzas para negocios y educación financiera: no es asesoría de inversión,
  // contabilidad ni impuestos (categorías reguladas).
  category: "BUSINESS_OPERATIONS",
  profile: {
    displayName: "José Miguel Acosta",
    headline: "Analista financiero · Finanzas corporativas y análisis de datos",
    career: {
      summary:
        "Soy José Miguel Acosta. Mi experiencia abarca análisis financiero, contabilidad y finanzas corporativas. He trabajado en reportes de resultados, análisis de flujo de caja, presupuestos y modelos financieros. Mi formación combina Economía, un MBA internacional y un máster en Finanzas e Inversiones. Busco ayudar a comprender la información financiera con claridad y convertirla en decisiones mejor fundamentadas.",
      experience:
        "Analista financiero y contable · Miami · desde junio de 2022\nReportes de pérdidas y ganancias, análisis de variaciones y flujo de caja, presupuestos y proyecciones, análisis de propiedades y tareas contables.",
      education:
        "Máster en Finanzas e Inversiones · University of North Carolina Wilmington · 2022–2023\nInternational MBA · Universitat de València · 2021–2022\nGrado en Economía · Universidad de Cantabria · 2017–2021",
      skills:
        "Análisis financiero, presupuestos, flujo de caja, modelos financieros, Excel, QuickBooks y Stripe. Conocimientos de valoración, renta fija y gestión de riesgos.\nIdiomas: español nativo, inglés avanzado, francés intermedio.",
      credentials: "",
    },
    city: "Miami",
    state: "FL",
    languages: ["es", "en", "fr"],
    consultationMode: "VIRTUAL",
    websiteUrl: "https://personalcfo.me/app/",
    socialLinks: { linkedin: "https://www.linkedin.com/in/miguel-acosta-martinez/" },
  },
  project: {
    name: "Personal CFO",
    url: "https://personalcfo.me/app/",
    description: "Tu proyecto de educación financiera personal, enlazado como sitio web de tu perfil.",
  },
  creatives: {
    basePath: "/professionals/kits/miguel-acosta",
    formats: ["1x1", "4x5", "9x16"],
    concepts: [
      { id: "01-banco-baja", title: "Tu banco bajó $500. ¿Tu patrimonio también?", topic: "Tu dinero, explicado", status: "READY_FOR_REVIEW" },
      { id: "02-dos-destinos", title: "Cada cuota tiene dos destinos.", topic: "Pago de un préstamo", status: "READY_FOR_REVIEW" },
      { id: "03-nueva-deuda", title: "Pedir prestado no te hace más rico.", topic: "Nueva deuda", status: "READY_FOR_REVIEW" },
      { id: "04-pago-extra", title: "$100 más al mes. ¿Cuánto ahorras?", topic: "Pagos extra", status: "READY_FOR_REVIEW" },
      { id: "05-cuota-corta", title: "Pagas cada mes y la deuda no baja.", topic: "Alerta de préstamo", status: "READY_FOR_REVIEW" },
      { id: "06-negativo", title: "Patrimonio negativo, pero mejorando.", topic: "Empezar en negativo", status: "READY_FOR_REVIEW" },
      {
        id: "07-pack-sesiones",
        title: "4 sesiones de 60 min con un profesional.",
        topic: "Habla con un profesional",
        status: "NEEDS_CONFIRMATION",
        note: "Incluye precios de sesiones. Confírmalos o ajústalos antes de usar esta pieza.",
      },
    ],
  },
  pendingConfirmations: [
    "Sube tu foto de perfil (por ahora mostramos un avatar).",
    "Revisa tu trayectoria: confirma si sigues en tu cargo actual y si quieres nombrar al empleador.",
    "Añade en Credenciales solo lo que esté vigente (por ejemplo, el estado de tu candidatura CFA).",
    "Conecta tu calendario en Agenda con tu enlace de reservas.",
    "Revisa tus 7 creativos y confirma los precios de la pieza de sesiones.",
  ],
};

/**
 * Marie Fernandez (Janet Marie Fernandez en su HV), Notary Public en Miami.
 * Aprobado por el dueño el 3-nov-2026 como NOTARY. Florida 117.05(10)-(11):
 * en español nunca "Notaria/Notario Público" ni "notario" (se dice "Notary
 * Public"), y todo anuncio en español lleva el aviso de no abogada en inglés
 * y en español (incluido en cada creativo). Preparación de impuestos (TAX,
 * regulada) queda fuera de su perfil de EVOLUSA: solo está en su sitio propio.
 */
const marieFernandez: PreparedKit = {
  id: "marie-fernandez",
  firstName: "Marie",
  category: "NOTARY",
  profile: {
    displayName: "Marie Fernandez",
    headline: "Notary Public en Florida · Atención bilingüe, 24/7 con cita previa",
    career: {
      summary:
        "Soy Marie Fernandez, Notary Public comisionada en Florida desde hace más de cuatro años. Tengo más de 20 años de trayectoria laboral en Estados Unidos, con experiencia en contabilidad, servicios de notarización, preparación de impuestos, educación preescolar y apoyo conductual. Atiendo en español y en inglés, con un servicio confiable, organizado, discreto y atento, y coordino citas las 24 horas, los 7 días, con cita previa.\n\nNo soy abogada autorizada para ejercer la abogacía en el Estado de Florida, y no puedo dar asesoría legal ni aceptar honorarios por asesoría legal.",
      experience:
        "Notary Public comisionada en Florida · Miami · más de 4 años\nNotarización de firmas, juramentos y afirmaciones, acknowledgments y affidavits; autorizaciones de viaje para menores, consentimientos y documentos comerciales presentados por el cliente; ceremonias de matrimonio en Florida; servicio móvil con cita previa; orientación y coordinación de apostillas ante la autoridad competente.\n\nTrayectoria en Estados Unidos · más de 20 años\nContabilidad y tareas administrativas y financieras, preparación de impuestos, educación preescolar y apoyo conductual.",
      education: "Estudios en Contabilidad.",
      skills:
        "Atención al cliente, comunicación bilingüe, organización documental, confidencialidad, atención al detalle, ética profesional, gestión de citas, flexibilidad horaria, coordinación de servicios móviles, verificación de identidad conforme a los procedimientos aplicables y trabajo con familias y comunidades diversas.\nIdiomas: español e inglés.",
      credentials: "",
    },
    city: "Miami",
    state: "FL",
    languages: ["es", "en"],
    consultationMode: "IN_PERSON",
    websiteUrl: null,
    socialLinks: {},
  },
  project: null,
  creatives: {
    basePath: "/professionals/kits/marie-fernandez",
    formats: ["1x1", "4x5", "9x16"],
    concepts: [
      { id: "01-disponible-24-7", title: "Disponible 24/7, con cita previa.", topic: "Notarización de documentos", status: "READY_FOR_REVIEW" },
      { id: "02-viaje-menores", title: "¿Tu hijo viaja sin ti?", topic: "Autorizaciones de viaje para menores", status: "READY_FOR_REVIEW" },
      { id: "03-matrimonio", title: "Celebramos tu matrimonio.", topic: "Ceremonias de matrimonio", status: "READY_FOR_REVIEW" },
    ],
  },
  pendingConfirmations: [
    "Sube tu foto de perfil (por ahora mostramos un avatar).",
    "Envía tu número de comisión de Notary Public para verificarla: hasta entonces tu perfil no recibe solicitudes.",
    "Confirma en Credenciales qué quieres mostrar (comisión, PTIN, RBT) y con su nombre oficial.",
    "Confirma si ofreces poderes (power of attorney) y documentos de bienes raíces, que aparecen en tu post pero no en tu hoja de vida.",
    "Revisa tus 3 creativos: cada uno lleva el aviso de no abogada que exige la ley de Florida.",
    "Conecta tu Instagram en Redes cuando te llegue la invitación de tester.",
  ],
};

const kits: Record<string, PreparedKit> = { [miguelAcosta.id]: miguelAcosta, [marieFernandez.id]: marieFernandez };

export function getPreparedKit(id: unknown): PreparedKit | null {
  return typeof id === "string" && Object.hasOwn(kits, id) ? kits[id] : null;
}

export function creativeSrc(kit: PreparedKit, conceptId: string, format: CreativeFormat): string {
  return `${kit.creatives.basePath}/${conceptId}-${format}.png`;
}

/** Profile columns the kit fills at provisioning time (professional_profiles, migrations 0005/0012/0015). */
export function preparedKitProfileColumns(kit: PreparedKit) {
  return {
    display_name: kit.profile.displayName,
    headline: kit.profile.headline,
    bio: serializeCareer(kit.profile.career),
    city: kit.profile.city,
    state: kit.profile.state,
    languages: kit.profile.languages,
    consultation_mode: kit.profile.consultationMode,
    website_url: kit.profile.websiteUrl,
    social_links: kit.profile.socialLinks,
  };
}
