import ProfessionalProfileView, { type ProfessionalWorkSample } from "@/components/professional/ProfessionalProfileView";
import type { ProfessionalProfilePublic } from "@/data/professional/types";

/**
 * TEMPORARY preview route — renders ProfessionalProfileView with a local
 * fixture (Mauricio Yepes' real portfolio info from C:\Projects\mauricio-portfolio)
 * so the owner can see how his own profile would look on EVOLUSA WITHOUT
 * writing anything to Supabase. Not linked from any nav. Delete once reviewed,
 * same pattern the component's own doc-comment describes for Milestone 02 QA.
 */
const mauricioFixture: ProfessionalProfilePublic = {
  slug: "mauricio-yepes",
  displayName: "Mauricio Yepes",
  category: "BUSINESS_MARKETING",
  headline: "Director Creativo y Especialista en Marketing con más de 12 años ayudando a negocios a construir su marca, su presencia digital y sus campañas.",
  bio: "Director Creativo, Especialista en Marketing y Diseñador Multidisciplinario con más de 12 años de experiencia creando marcas, campañas publicitarias, publicaciones editoriales, sitios web y experiencias digitales. Ha trabajado con marcas como FK Irons, Microbeau, Resource Living y Evenflo Colours, además de negocios independientes en Estados Unidos y Latinoamérica. Su trabajo abarca identidad de marca, diseño editorial, marketing digital, diseño web y flujos de trabajo asistidos por IA — generalmente dentro del mismo proyecto, ya que la mayoría de los clientes no tiene presupuesto para cinco especialistas distintos. Fundador y Director Creativo de Real Group Entertainment LLC (Miami, FL) desde 2021.",
  state: "FL",
  city: "Miami",
  languages: ["es", "en"],
  consultationMode: "BOTH",
  isAcceptingClients: true,
  identityVerified: false,
};

const workSamples: ProfessionalWorkSample[] = [
  {
    title: "Resource Living — Campaña de ventas publicitarias",
    image: "/images/professionals/mauricio/work/resource-living.jpg",
    description: "Dirección creativa de una campaña de generación de leads para contratistas del sur de la Florida.",
  },
  {
    title: "Microbeau — Beauty in Authenticity",
    image: "/images/professionals/mauricio/work/microbeau.jpg",
    description: "Campaña de marca para una empresa internacional de maquillaje permanente.",
  },
  {
    title: "Real Group Entertainment — Capacidades",
    image: "/images/professionals/mauricio/work/real-group-entertainment.jpg",
    description: "Identidad y presentación de servicios de su propia agencia creativa.",
  },
];

export default function PreviewMauricioPage() {
  return (
    <ProfessionalProfileView
      professional={mauricioFixture}
      photoUrl="/images/professionals/mauricio/photo.jpg"
      contactEmail="rgentertainmentmanagement@gmail.com"
      workSamples={workSamples}
    />
  );
}
