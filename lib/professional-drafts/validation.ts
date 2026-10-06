import { applicationCategoryOptions } from '../../data/professional-applications/categories.ts';
import { sanitizeUrl } from '../professional/profile-links.ts';

export const professionalDraftVersion = 'professional-draft-v1';
export type ProfessionalDraft = {
  displayName: string;
  category: string;
  city: string;
  headline: string;
  bio: string;
  instagram: string;
  facebook: string;
  website: string;
};
export function parseProfessionalDraft(value: unknown): ProfessionalDraft | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const limits = { displayName: 200, category: 40, city: 100, headline: 200, bio: 1200, instagram: 500, facebook: 500, website: 500 };
  const draft = {} as ProfessionalDraft;
  for (const key of Object.keys(limits) as (keyof ProfessionalDraft)[]) {
    if (typeof input[key] !== 'string') return null;
    const text = input[key].trim();
    if (text.length > limits[key]) return null;
    draft[key] = text;
  }
  if (!draft.displayName || !applicationCategoryOptions.some(option => option.id === draft.category)) return null;
  for (const key of ['instagram', 'facebook', 'website'] as const) {
    if (draft[key] && !sanitizeUrl(draft[key])) return null;
  }
  return draft;
}
