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
  /** Default category when the admin doesn't pass one. Only non-regulated categories. */
  category: "BUSINESS_MARKETING" | "BUSINESS_OPERATIONS";
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

const kits: Record<string, PreparedKit> = { [miguelAcosta.id]: miguelAcosta };

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
