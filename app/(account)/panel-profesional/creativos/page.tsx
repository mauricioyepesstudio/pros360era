import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/account/PageHeader";
import PreparedKitCreatives from "@/components/professional/PreparedKitCreatives";
import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyPreparedKit } from "@/lib/professional/prepared-kit";
import { getMyProfessionalProfile } from "@/lib/professional/self-profile";
import { weeklyPlannerSuggestions } from "@/lib/professional-planner/weekly-review";

export default async function ProfessionalCreativesPage() {
  await requireProfessionalArea();
  const [kit, profile] = await Promise.all([getMyPreparedKit(), getMyProfessionalProfile()]);
  const proposals = weeklyPlannerSuggestions(profile, new Date().toISOString().slice(0, 10));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Panel profesional" title="Tus creativos"
        description="Revisa tus propuestas semanales y continúa al planner para guardarlas como Ideas. Aquí no se publica ni se programa nada." />
      {proposals.length > 0 && <section aria-labelledby="weekly-creatives" className="space-y-5">
        <h2 id="weekly-creatives" className="text-xl font-bold text-[var(--brand-navy)]">Propuestas de esta semana</h2>
        <p className="text-sm leading-6 text-[var(--muted)]">Plantillas privadas con el contexto de tu perfil. La referencia visual puede venir de tu perfil o usar una imagen ilustrativa de EVOLUSA. La propuesta de reel incluye portada y guion, no video. Revisa marca, derechos de imagen y contenido antes de usarlas.</p>
        <div className="grid gap-6 md:grid-cols-3">{proposals.map(item => <article key={item.id} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
          <h3 className="font-bold text-[var(--brand-navy)]">{item.title}</h3>
          {item.imageUrl && <><Image unoptimized src={item.imageUrl} alt={item.title} width={1080} height={item.format === "9x16" ? 1920 : 1350} className="mt-4 h-auto w-full rounded-[var(--radius-md)]" /><a href={item.imageUrl + "&download=1"} className="inline-flex min-h-11 items-center font-semibold underline">Descargar borrador PNG</a></>}
          <p className="mt-3 whitespace-pre-line text-sm leading-6">{item.caption}</p>
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">{item.note}</p>
        </article>)}</div>
        <Link href="/panel-profesional/planner?review=weekly#propuestas" className="inline-flex min-h-11 items-center rounded-full bg-[var(--brand-blue)] px-6 font-bold text-white">Elegir y guardar en mi planner</Link>
      </section>}
      {kit ? <PreparedKitCreatives kit={kit} /> : proposals.length === 0 ? <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6"><p>No pudimos cargar propuestas. <Link className="underline" href="/panel-profesional/perfil">Revisa tu perfil profesional</Link> o vuelve a intentarlo.</p></section> : null}
    </div>
  );
}
