import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublicProfessionalBySlug } from "@/lib/professional/public-profile";
import { pilotEnabled } from "@/lib/inquiries/validation";
import { requireMemberArea } from "@/lib/account/role-gate";
import ProfileInquiryForm from "@/components/inquiries/ProfileInquiryForm";

type Props = {params:Promise<{slug:string}>};
const pilotCategories = new Set(["BUSINESS_MARKETING","BUSINESS_OPERATIONS"]);

export default async function SolicitarProfesionalPage({params}:Props) {
  // Feature gate before reads or access to submission UI; off unless explicitly enabled.
  if(!pilotEnabled()) notFound();
  await requireMemberArea();
  const {slug}=await params;
  const profile=await getPublicProfessionalBySlug(slug);
  if(!profile || !profile.isAcceptingClients || !pilotCategories.has(profile.category)) notFound();

  return <main className="mx-auto max-w-3xl px-5 py-10">
    <Link href={`/profesionales/${profile.slug}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-blue)]"><ArrowLeft size={16}/> Regresar al perfil</Link>
    <div className="mb-6 rounded-2xl bg-[var(--sky-surface)] p-5 text-sm leading-6 text-[var(--brand-navy)]"><b>Piloto de captación con consentimiento:</b> solo marketing y operaciones. La solicitud no garantiza respuesta inmediata ni contratación. No se ejecutan notificaciones automáticas.</div>
    <ProfileInquiryForm slug={profile.slug} professionalName={profile.displayName}/>
  </main>;
}
