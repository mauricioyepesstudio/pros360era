import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyProfessionalSchedule } from "@/lib/professional-schedule/persistence";
import PageHeader from "@/components/account/PageHeader";
import ProfessionalScheduleForm from "@/components/professional/ProfessionalScheduleForm";
import { parseBookingUrl } from "@/lib/professional-schedule/validation";
export default async function ProfessionalAgendaPage(){
 await requireProfessionalArea();const result=await getMyProfessionalSchedule();const link=parseBookingUrl(result.bookingUrl);
 return <div className="mx-auto max-w-3xl space-y-6"><PageHeader eyebrow="Panel profesional" title="Agenda profesional" description="Administra tus preferencias de disponibilidad y el enlace de tu proveedor de reservas."/>{result.available?<ProfessionalScheduleForm initial={result.schedule} bookingUrl={link.valid?link.url:null}/>:<p role="alert" className="rounded-xl border border-[var(--border)] bg-white p-6">No pudimos consultar tu agenda. Necesitas un perfil profesional propio y el servicio disponible; reintenta más tarde.</p>}</div>;
}
