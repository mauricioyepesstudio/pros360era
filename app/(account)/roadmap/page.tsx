import PageHeader from "@/components/account/PageHeader";
import RoadmapBoard from "@/components/account/RoadmapBoard";
import { previewProfile } from "@/data/account/foundation";
import { generateAccountRoadmap } from "@/lib/account/roadmap-engine";
export default function RoadmapPage(){return <div><PageHeader eyebrow="Roadmap determinista" title="Tu próximo paso, explicado" description="Las recomendaciones se generan con reglas transparentes a partir de necesidades generales y cambios seleccionados."/><div className="mt-8"><RoadmapBoard roadmap={generateAccountRoadmap(previewProfile)}/></div><p className="mt-6 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">EVOLUSA ofrece orientación educativa general. Los elementos profesionales requieren un proveedor apropiado y no constituyen asesoría legal, migratoria, fiscal, financiera ni de seguros.</p></div>}
