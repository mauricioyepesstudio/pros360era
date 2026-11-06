/**
 * Filtro de cumplimiento del cerebro: revisa cada borrador antes de que el
 * profesional lo vea. No reemplaza a `compliance-reviewer`; frena lo que las
 * reglas de EVOLUSA nunca permiten (cifras prometidas, «verificado», servicios
 * regulados, «notario» en anuncios de Florida) y exige el aviso del perfil.
 * Datos puros para probarlo con node --test.
 */
import { claims } from "../../data/compliance/claims.ts";

export type ComplianceLevel = "block" | "review";
export type ComplianceIssue = { id: string; level: ComplianceLevel; message: string };
export type ComplianceResult = { status: "ok" | "needs_review" | "blocked"; issues: ComplianceIssue[] };

type Rule = { id: string; level: ComplianceLevel; pattern: RegExp; message: string };

const rules: readonly Rule[] = [
  { id: "promised-figure", level: "block", pattern: /\d+(?:[.,]\d+)?\s*%/, message: "Tiene un porcentaje. En EVOLUSA no se prometen cifras." },
  { id: "promised-money", level: "block", pattern: /(?:\$\s?\d|\d\s?(?:usd|dólares|dolares|dollars)\b)/i, message: "Tiene una cifra de dinero. Quítala o confírmala con el dueño." },
  { id: "promised-multiplier", level: "block", pattern: /\b\d+\s*(?:x|veces|times)\b/i, message: "Promete multiplicar resultados." },
  { id: "promised-deadline", level: "block", pattern: /\b(?:en|in)\s+\d+\s+(?:días|dias|days|semanas|weeks|meses|months)\b/i, message: "Promete un plazo de resultados." },
  { id: "guarantee", level: "block", pattern: /garantiz|guarantee|resultados asegurados|100\s*%/i, message: "Promete o garantiza resultados." },
  { id: "verified", level: "block", pattern: /\bverificad[oa]s?\b|\bverified\b/i, message: "Di «perfil aprobado», nunca «verificado»." },
  { id: "notario", level: "block", pattern: /\bnotari[oa]s?\b|\bnotaría\b|\bnotaria pública\b/i, message: "En Florida no se usa «notario/notaria» en anuncios; escribe «Notary Public» en inglés." },
  { id: "regulated-legal", level: "review", pattern: /asesor[ií]a legal|legal advice|\babogad[oa]s?\b|\battorney\b/i, message: "Menciona servicios legales (categoría regulada)." },
  { id: "regulated-immigration", level: "review", pattern: /inmigraci|migratori|immigration|\bvisas?\b|green card|\basilo\b|asylum/i, message: "Menciona inmigración (categoría regulada)." },
  { id: "regulated-tax", level: "review", pattern: /impuestos|\btaxes\b|\btax\b|estrategia fiscal/i, message: "Menciona impuestos (categoría regulada)." },
  { id: "regulated-insurance", level: "review", pattern: /\bseguros? de\b|\binsurance\b/i, message: "Menciona seguros (categoría regulada)." },
];

const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
const prohibited = claims.filter((claim) => claim.status !== "ALLOWED").map((claim) => ({ id: `claim-${claim.id}`, text: normalize(claim.text).replace(/[.!]$/, "") }));

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function checkDraft(text: string, options: { disclaimer?: string; avoidWords?: readonly string[] } = {}): ComplianceResult {
  const issues: ComplianceIssue[] = [];
  const disclaimer = options.disclaimer?.trim();
  // El aviso obligatorio puede nombrar servicios regulados («not an attorney»); no cuenta como oferta.
  const body = disclaimer ? text.replace(new RegExp(escapeRegExp(disclaimer), "gi"), " ") : text;
  for (const rule of rules) if (rule.pattern.test(body)) issues.push({ id: rule.id, level: rule.level, message: rule.message });
  const plain = normalize(body);
  for (const claim of prohibited) if (plain.includes(claim.text)) issues.push({ id: claim.id, level: "block", message: "Repite un claim que `claims.ts` no permite publicar." });
  for (const word of options.avoidWords ?? []) {
    if (word && plain.includes(normalize(word))) issues.push({ id: `avoid-${normalize(word)}`, level: "review", message: `Usa «${word}», que está en tus palabras a evitar.` });
  }
  if (disclaimer && !normalize(text).includes(normalize(disclaimer))) issues.push({ id: "missing-disclaimer", level: "block", message: "Falta el aviso obligatorio de tu perfil." });
  const status = issues.some((issue) => issue.level === "block") ? "blocked" : issues.length ? "needs_review" : "ok";
  return { status, issues };
}

/** Agrega el aviso obligatorio al final si el texto no lo trae completo. */
export function withDisclaimer(text: string, disclaimer: string): string {
  const clean = disclaimer.trim();
  if (!clean || normalize(text).includes(normalize(clean))) return text;
  return `${text.trimEnd()}\n\n${clean}`;
}
