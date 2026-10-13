import { creativeSrc, type PreparedKit } from "../../data/professional/prepared-kits.ts";
import { plannerMaxPosts, sortPosts, type PlannerPost } from "./validation.ts";

export type PlannerSuggestion = { id: string; title: string; caption: string; imageUrl: string | null; source: "Tu kit" | "Plantilla editable" };

/** Owner's existing assets plus prompts: no invented credentials, results or AI claims. */
export function plannerSuggestions(kit: PreparedKit | null, displayName: string | null): PlannerSuggestion[] {
  const fromKit: PlannerSuggestion[] = kit ? kit.creatives.concepts.filter((concept) => concept.status !== "NEEDS_CONFIRMATION").map((concept) => ({ id: `suggest-kit-${concept.id}`, title: concept.title, caption: "", imageUrl: creativeSrc(kit, concept.id, "4x5"), source: "Tu kit" })) : [];
  return [...fromKit, ...[
    { id: "suggest-presentation", title: displayName ? `Conoce a ${displayName}`.slice(0, 140) : "Presenta tu trabajo", caption: "Cuenta a quién ayudas, qué servicio ofreces y cómo pueden contactarte." },
    { id: "suggest-process", title: "Así es mi proceso de trabajo", caption: "Describe los pasos reales de tu servicio y qué necesita preparar la persona antes de empezar." },
    { id: "suggest-question", title: "Responde una pregunta frecuente", caption: "Elige una pregunta que recibas a menudo y escribe una respuesta útil, sin prometer resultados." },
  ].map((item): PlannerSuggestion => ({ ...item, imageUrl: null, source: "Plantilla editable" }))];
}

/** A suggestion has a stable ID: repeated selection never duplicates a post. */
export function addPlannerSuggestions(posts: PlannerPost[], suggestions: PlannerSuggestion[], selected: string[], date: string): PlannerPost[] | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) return null;
  const additions = suggestions.filter((item) => selected.includes(item.id) && !posts.some((post) => post.id === item.id)).map((item): PlannerPost => ({ id: item.id, title: item.title, caption: item.caption, imageUrl: item.imageUrl, date, time: "12:00", platform: "instagram", format: "4x5", status: "IDEA", note: "Sugerencia editable. Revisa el texto y la imagen antes de publicar." }));
  return posts.length + additions.length > plannerMaxPosts ? null : sortPosts([...posts, ...additions]);
}
