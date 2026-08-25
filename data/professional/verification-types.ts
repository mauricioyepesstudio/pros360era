/**
 * EVOLUSA Verified — code catalog for verification types, mirroring the
 * exact pattern already established for professional categories
 * (data/professional/categories.ts): one MVP value enabled, the DB check
 * constraint on professional_verifications.verification_type widens in a
 * small follow-up migration when a second type is actually added — not a
 * config flip.
 *
 * V1 supports ONLY identity verification. This is deliberately not the
 * fuller shape sketched in EVOLUSA-TRUST-COMPLIANCE.md/EVOLUSA-PROFESSIONAL-
 * NETWORK.md (ten candidate types, evidence metadata, credential
 * identifiers) — that shape is for when a REGULATED category and a real
 * evidence/document pipeline exist. Building it now against one non-
 * regulated category with no evidence storage would be premature.
 */
export const verificationTypeIds = ["IDENTITY_VERIFIED"] as const;
export type VerificationTypeId = (typeof verificationTypeIds)[number];

export const verificationStatuses = ["PENDING", "VERIFIED", "REJECTED", "REVOKED"] as const;
export type VerificationStatus = (typeof verificationStatuses)[number];

export type VerificationType = {
  id: VerificationTypeId;
  /** Short badge label — the only text shown before the badge is expanded. */
  label: string;
  /** What this type actually proves — used to keep public-facing copy honest, never overclaiming. */
  provesLabel: string;
  /** Explicit reminder of what this type does NOT prove — the disclosure text draws directly from this. */
  doesNotProve: readonly string[];
};

export const verificationTypes = [
  {
    id: "IDENTITY_VERIFIED",
    label: "Identidad verificada",
    provesLabel: "EVOLUSA verificó la identidad asociada a esta cuenta mediante una revisión manual.",
    doesNotProve: ["licencias profesionales", "certificaciones", "experiencia", "resultados"],
  },
] as const satisfies readonly VerificationType[];

export function getVerificationType(id: string) {
  return verificationTypes.find((type) => type.id === id);
}

/**
 * Composes the full disclosure sentence from provesLabel + doesNotProve —
 * the single source of truth for this copy, so a future component never
 * hardcodes its own paraphrase. Closes with the same "no sustituye
 * asesoría profesional" line for every verification type, since that
 * caveat applies universally regardless of what a given type proves.
 */
export function getVerificationDisclosure(id: string): string | undefined {
  const type = getVerificationType(id);
  if (!type) return undefined;

  // "ni" (not "y"), since this list only ever appears inside a negated
  // clause — "no constituye validación de X, Y ni Z" — for which "ni" is
  // the grammatically correct conjunction in Spanish.
  const items = type.doesNotProve;
  const list = items.length > 1 ? `${items.slice(0, -1).join(", ")} ni ${items[items.length - 1]}` : items[0];

  return `${type.provesLabel} Esto no constituye validación de ${list}, y no sustituye asesoría profesional.`;
}
