import { careerSections, hasCareerContent, parseCareer } from "@/lib/professional/career";

export default function ProfessionalCareerView({ bio }: { bio: string | null }) {
  const career = parseCareer(bio);
  if (!hasCareerContent(career)) return null;

  return (
    <div className="space-y-6">
      {careerSections
        .filter((section) => career[section.key].trim().length > 0)
        .map((section) => (
          <section key={section.key} className="space-y-2">
            <h3 className="text-lg font-bold text-[var(--brand-navy)]">{section.label}</h3>
            <p className="whitespace-pre-wrap break-words leading-7 text-[var(--muted)]">{career[section.key]}</p>
            {section.key === "credentials" && (
              <p className="text-xs leading-5 text-[var(--muted)]">
                Información declarada por el profesional. EVOLUSA no ha verificado estas credenciales.
              </p>
            )}
          </section>
        ))}
    </div>
  );
}
