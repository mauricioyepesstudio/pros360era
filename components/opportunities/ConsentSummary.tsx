import type { ConsentDataCategory } from "@/data/opportunities/types";
import { consentDataCategoryLabels } from "@/data/opportunities/copy";

/**
 * Shared by both the member's own card ("lo que autorizaste compartir") and
 * the professional's card ("información que puedes ver") — same list, same
 * labels, rendered from the same consent_receipts.data_categories array
 * either side already has. Never renders anything beyond this fixed
 * five-category catalog — there is no freeform field to leak.
 */
export default function ConsentSummary({ categories, heading }: { categories: readonly ConsentDataCategory[]; heading: string }) {
  if (categories.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{heading}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {categories.map((category) => (
          <li key={category} className="rounded-[var(--radius-pill)] bg-[var(--sky-surface)] px-3 py-1 text-xs font-semibold text-[var(--brand-navy)]">
            {consentDataCategoryLabels[category]}
          </li>
        ))}
      </ul>
    </div>
  );
}
