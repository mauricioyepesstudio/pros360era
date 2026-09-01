/**
 * EVOLUSA Verified — code catalog for verification types, mirroring the
 * exact pattern already established for professional categories
 * (data/professional/categories.ts): each value is enabled only after the
 * DB check constraint on professional_verifications.verification_type is
 * widened in a small, reviewed migration when the type is actually added —
 * never a config flip.
 *
 * V1 (0006_evolusa_verified_v1.sql) shipped exactly one type,
 * IDENTITY_VERIFIED, deliberately not the fuller shape sketched in
 * EVOLUSA-TRUST-COMPLIANCE.md/EVOLUSA-PROFESSIONAL-NETWORK.md (ten candidate
 * types, evidence metadata, credential identifiers) — building that against
 * one non-regulated category with no evidence storage would have been
 * premature.
 *
 * V2 (0013_evolusa_notary_regulated_category.sql) adds a second type,
 * NOTARY_COMMISSION_VERIFIED, for the first REGULATED category (NOTARY).
 *
 * Design decision, recorded here deliberately (see 0013's own migration
 * header for the fuller reasoning): this is a CATEGORY-SPECIFIC
 * verification type, not a generic PROFESSIONAL_LICENSE_VERIFIED bucket
 * that a future TAX credential would reuse. A generic type would save one
 * future CHECK-constraint widening + one future catalog entry when TAX is
 * added, but it would force provesLabel/doesNotProve — the exact text a
 * member reads to decide whether to trust a professional — to either stay
 * vague ("a license was checked") or silently describe different realities
 * (a notary commission number checked against Florida's public notary
 * registry vs. a CPA license/PTIN checked against a state board or IRS
 * database are different checks, against different authorities, proving
 * different things) under one shared label. For a platform whose target
 * community is specifically vulnerable to "notario" fraud, a vague or
 * overloaded badge is a worse failure mode than one extra migration per
 * regulated category — this repo's own established convention (categories,
 * needs, regulatory-policy rows) is already "explicit enumeration, never a
 * shared generic bucket" for exactly this class of trust-bearing fact.
 * Adding TAX_CREDENTIAL_VERIFIED later is the same trivial, reviewed,
 * one-more-entry pattern as this file already demonstrates going from one
 * type to two — not new plumbing.
 */
export const verificationTypeIds = ["IDENTITY_VERIFIED", "NOTARY_COMMISSION_VERIFIED"] as const;
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
  {
    id: "NOTARY_COMMISSION_VERIFIED",
    label: "Comisión de notario verificada",
    // Deliberately names the specific authority and record checked, not a
    // vague "license verified" — see this file's header comment on why a
    // category-specific type exists at all. Never claims the commission is
    // CURRENTLY in good standing beyond the check date (see doesNotProve).
    provesLabel:
      "EVOLUSA verificó el número de comisión de notario público declarado por este profesional contra el registro público de la Secretaría de Estado de Florida (Florida Department of State), en la fecha de la verificación.",
    doesNotProve: [
      "que la comisión siga vigente después de la fecha de verificación",
      "la calidad o corrección de un acto notarial específico",
      "que el notario esté libre de sanciones, quejas o investigaciones posteriores",
      "asesoría legal",
    ],
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
