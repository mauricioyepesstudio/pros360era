import PageHeader from "@/components/account/PageHeader";
import NewOpportunityFlow from "@/components/opportunities/NewOpportunityFlow";
import { liveNeeds } from "@/data/needs/catalog";

export default function NuevaConexionPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Nueva conexión"
        title="Cuéntanos qué necesitas"
        description="Buscamos una opción compatible según tu categoría, tu estado y tu idioma preferido."
      />
      <NewOpportunityFlow needs={liveNeeds} />
    </div>
  );
}
