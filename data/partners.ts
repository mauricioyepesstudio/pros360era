/**
 * Aliados que recomiendan EVOLUSA a su comunidad. Solo atribución: un
 * aliado NO recibe pagos, comisiones ni tarifas por persona referida (no
 * hay pagos implementados). Un aliado con `regulated: true` presta su
 * servicio por su cuenta; EVOLUSA nunca presenta ni vende ese servicio.
 *
 * Enlaces externos del aliado: solo los confirmados por el dueño. Si no
 * hay enlace confirmado, se deja vacío y la página no muestra ninguno.
 */
export type Partner = {
  /** Slug en minúsculas, usado en /aliados/<slug> y en ?ref=<slug>. */
  slug: string;
  name: string;
  shortDescription: string;
  /** El servicio del aliado es de categoría regulada (p. ej. inmigración). */
  regulated: boolean;
  /** Aviso específico del aliado; obligatorio cuando `regulated` es true. */
  serviceNotice?: string;
  website?: string;
  whatsapp?: string;
};

export const partners = [
  {
    slug: "1migration",
    name: "1MIGRATION",
    shortDescription: "Preparación de documentos migratorios para la comunidad hispana.",
    regulated: true,
    serviceNotice:
      "1MIGRATION es una empresa independiente de preparación de documentos. No es un bufete de abogados ni ofrece asesoría legal. Sus trámites se contratan y se atienden directamente con 1MIGRATION, no con EVOLUSA.",
    // Pendiente: el dueño debe confirmar el sitio web y el WhatsApp de 1MIGRATION.
    website: undefined,
    whatsapp: undefined,
  },
] as const satisfies readonly Partner[];

export type PartnerSlug = (typeof partners)[number]["slug"];
