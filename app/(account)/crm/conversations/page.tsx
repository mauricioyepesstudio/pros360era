import PageHeader from "@/components/account/PageHeader";
import ButtonLink from "@/components/ui/ButtonLink";

export default function ConversationsPage() {
  return <div className="space-y-6">
    <PageHeader eyebrow="CRM" title="Conversaciones en preparación" description="Los canales de mensajería todavía no están conectados. No se muestran conversaciones ni se envían mensajes automáticos desde este espacio." />
    <ButtonLink href="/crm/leads">Revisar mis prospectos</ButtonLink>
  </div>;
}
