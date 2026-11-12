import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublicProfessionalBySlug } from "@/lib/professional/public-profile";
import { pilotEnabled } from "@/lib/inquiries/validation";
import { requireMemberArea } from "@/lib/account/role-gate";
import ProfileInquiryForm from "@/components/inquiries/ProfileInquiryForm";

type Props = {params:Promise<{slug:string}>};
const pilotProfiles = new Set(["mauricio-yepes-b96cae", "jose-miguel-acosta-34c676", "1migration-b2bfe2", "marie-fernandez-efff0e"]);

export default async function SolicitarProfesionalPage({params}:Props) {
  // Feature gate before reads or access to submission UI; off unless explicitly enabled.
  if(!pilotEnabled()) notFound();
  await requireMemberArea();
  const {slug}=await params;
  const profile=await getPublicProfessionalBySlug(slug);
  if(!profile || !profile.isAcceptingClients || !pilotProfiles.has(profile.slug)) notFound();

  return <main className="mx-auto max-w-3xl px-5 py-10">
    <Link href={`/profesionales/${profile.slug}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-blue)]"><ArrowLeft size={16}/> Regresar al perfil</Link>
    <div className="mb-6 rounded-2xl bg-[var(--sky-surface)] p-5 text-sm leading-6 text-[var(--brand-navy)]"><b>Piloto de captación con consentimiento:</b> marketing, operaciones, preparación documental y notaría. La solicitud no garantiza respuesta inmediata ni contratación. No se ejecutan notificaciones automáticas.</div>
    {profile.category === "IMMIGRATION_DOCUMENT_SUPPORT" && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Solo apoyo administrativo de documentos. No ofrecemos asesoría legal, representación migratoria ni evaluación de elegibilidad. No incluyas números de caso ni detalles personales delicados.</p>}
    {profile.category === "NOTARY" && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Solicita información general para una cita. La notarización requiere comprobación de identidad y actuación de la notaria autorizada; no se realiza por este formulario.</p>}
    <ProfileInquiryForm slug={profile.slug} professionalName={profile.displayName}/>
  </main>;
}
