import { requireProfessionalArea } from "@/lib/account/role-gate";
import PageHeader from "@/components/account/PageHeader";
import ButtonLink from "@/components/ui/ButtonLink";

export const metadata = {
  title: "Crecimiento en preparación | EVOLUSA",
  description: "Estado de disponibilidad de las herramientas de crecimiento profesional.",
};

/** All growth screens stay unavailable until OAuth persistence is implemented and verified. */
export default async function GrowthAutomationLayout() {
  await requireProfessionalArea();
  return <div className="space-y-6">
    <PageHeader eyebrow="Herramientas profesionales" title="Crecimiento en preparación" description="La conexión de redes sociales y las automatizaciones todavía no están disponibles." />
    <p className="max-w-2xl leading-7 text-[var(--muted)]">Por ahora no puedes conectar cuentas, publicar contenido ni activar respuestas automáticas desde EVOLUSA. Antes de habilitar estas funciones, verificaremos la autorización de las cuentas, el almacenamiento seguro y una prueba completa del recorrido.</p>
    <ButtonLink href="/panel-profesional/perfil">Completar mi perfil profesional</ButtonLink>
  </div>;
}
