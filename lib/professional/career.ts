/**
 * Canonical, human-readable career sections stored in the existing
 * professional_profiles.bio column. This module is the only source of truth
 * for the format, labels and aggregate limit.
 */
export const careerSections = [
  { key: "summary", label: "Presentación", hint: "A quién ayudas y cuál es tu experiencia." },
  { key: "experience", label: "Experiencia", hint: "Cargo, empresa, fechas y funciones. Confirma los períodos que siguen vigentes." },
  { key: "education", label: "Formación", hint: "Título, institución y fechas. Distingue estudios terminados y en curso." },
  { key: "skills", label: "Habilidades", hint: "Herramientas, conocimientos y especialidades que realmente manejas." },
  { key: "credentials", label: "Credenciales y cursos", hint: "Incluye solo datos reales. Esto no equivale a una verificación de EVOLUSA." },
] as const;

export type CareerKey = (typeof careerSections)[number]["key"];
export type ProfessionalCareer = Record<CareerKey, string>;

export const careerBioLimit = 10_000;
export const careerMarker = "Perfil profesional EVOLUSA v1\n\n";

const sectionHeader = (label: string) => `## ${label}\n`;
const reservedLines = new Set(careerSections.map((section) => `## ${section.label}`));

function encodeValue(value: string): string {
  return value
    .split("\n")
    .map((line) => (line.startsWith("\\") || reservedLines.has(line) ? `\\${line}` : line))
    .join("\n");
}

function decodeValue(value: string): string {
  return value
    .split("\n")
    .map((line) => (line.startsWith("\\") ? line.slice(1) : line))
    .join("\n");
}

export function emptyCareer(): ProfessionalCareer {
  return { summary: "", experience: "", education: "", skills: "", credentials: "" };
}

/**
 * Parses only the complete, ordered v1 format. A legacy or malformed value
 * remains intact in summary so public rendering and the editors never drop it.
 */
export function parseCareer(bio: string | null | undefined): ProfessionalCareer {
  const text = bio ?? "";
  const result = emptyCareer();
  const headers = careerSections.map((section) => sectionHeader(section.label));

  if (!text.startsWith(careerMarker + headers[0])) return { ...result, summary: text };

  let cursor = careerMarker.length + headers[0].length;
  for (let index = 0; index < headers.length - 1; index += 1) {
    const nextHeader = `\n\n${headers[index + 1]}`;
    const next = text.indexOf(nextHeader, cursor);
    if (next < 0) return { ...result, summary: text };
    result[careerSections[index].key] = decodeValue(text.slice(cursor, next));
    cursor = next + nextHeader.length;
  }

  result.credentials = decodeValue(text.slice(cursor));

  // Only our unique escaped representation is canonical. Anything that
  // merely resembles it falls back byte-for-byte to the legacy summary.
  return serializeCareer(result) === text ? result : { ...emptyCareer(), summary: text };
}

/** Preserves field contents exactly; empty fields remain valid and parseable. */
export function serializeCareer(career: ProfessionalCareer): string {
  return careerMarker + careerSections
    .map((section) => `${sectionHeader(section.label)}${encodeValue(career[section.key])}`)
    .join("\n\n");
}

export function hasCareerContent(value: ProfessionalCareer | string | null | undefined): boolean {
  const career = typeof value === "object" && value !== null ? value : parseCareer(value);
  return careerSections.some((section) => career[section.key].trim().length > 0);
}

export function validateCareer(career: ProfessionalCareer): string | null {
  for (const section of careerSections) {
    const value = career[section.key];
    if (typeof value !== "string") return "Revisa los campos de tu trayectoria.";
  }

  return serializeCareer(career).length > careerBioLimit
    ? `Tu trayectoria supera ${careerBioLimit} caracteres. Reduce el texto antes de guardar.`
    : null;
}

/**
 * Server boundary for the existing bio field. Plain legacy text is accepted;
 * a value claiming the EVOLUSA marker must be a complete canonical document.
 */
export function validateCareerBio(bio: unknown): bio is string | null | undefined {
  if (bio === null || bio === undefined) return true;
  if (typeof bio !== "string" || bio.length > careerBioLimit) return false;
  if (!bio.startsWith(careerMarker)) return true;

  const parsed = parseCareer(bio);
  return validateCareer(parsed) === null && serializeCareer(parsed) === bio;
}
