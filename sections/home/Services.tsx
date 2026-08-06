import Section from "@/components/ui/Section";
import {
  Building2,
  FileText,
  ShieldCheck,
  Stamp,
  Megaphone,
  BriefcaseBusiness,
  ArrowUpRight,
} from "lucide-react";

const services = [
  {
    title: "Creación de Empresas",
    description:
      "LLC, Corporaciones, EIN y toda la documentación necesaria para comenzar correctamente.",
    icon: Building2,
    number: "01",
  },
  {
    title: "Taxes & Bookkeeping",
    description:
      "Preparación de impuestos personales y corporativos, bookkeeping y planificación fiscal.",
    icon: FileText,
    number: "02",
  },
  {
    title: "Notary & Documentos",
    description:
      "Notarizaciones, traducciones certificadas y documentación oficial.",
    icon: Stamp,
    number: "03",
  },
  {
    title: "Seguros",
    description:
      "Auto, negocio, responsabilidad civil, workers compensation y más.",
    icon: ShieldCheck,
    number: "04",
  },
  {
    title: "Marketing Digital",
    description:
      "Sitios web, Google, redes sociales y generación de clientes.",
    icon: Megaphone,
    number: "05",
  },
  {
    title: "Consultoría Empresarial",
    description:
      "Estrategias para organizar, proteger y hacer crecer tu empresa.",
    icon: BriefcaseBusiness,
    number: "06",
  },
];

export default function Services() {
  return (
    <Section
      id="services"
      className="bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] py-32"
    >
      <div className="mx-auto mb-24 max-w-4xl text-center">
        <span className="inline-flex rounded-full bg-[#D4A23A]/10 px-5 py-2 text-sm font-semibold text-[#D4A23A]">
          Nuestros Servicios
        </span>

        <h2 className="mt-6 text-5xl font-extrabold leading-tight text-[#0D1B3D] md:text-6xl">
          Todo lo que necesitas
          <br />
          en un solo lugar.
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-600">
          Ayudamos a inmigrantes, familias y empresarios con soluciones
          integrales para crecer en Estados Unidos.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <div
              key={service.number}
              className="
                group
                relative
                overflow-hidden
                rounded-[34px]
                border
                border-slate-200
                bg-white
                p-10
                shadow-[0_20px_60px_-35px_rgba(15,23,42,.20)]
                transition-all
                duration-500
                hover:-translate-y-4
                hover:border-[#D4A23A]
                hover:shadow-[0_35px_90px_-35px_rgba(13,27,61,.30)]
              "
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[#D4A23A] scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100" />

              <div className="absolute -right-6 -top-6 text-[110px] font-black text-slate-100 transition-all duration-500 group-hover:text-[#D4A23A]/10">
                {service.number}
              </div>

              <div className="relative z-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4A23A]/10 transition-all duration-500 group-hover:bg-[#D4A23A]">
                  <Icon
                    size={30}
                    strokeWidth={1.8}
                    className="text-[#D4A23A] transition-all duration-500 group-hover:text-white group-hover:scale-110"
                  />
                </div>

                <h3 className="mt-8 text-2xl font-bold text-[#0D1B3D]">
                  {service.title}
                </h3>

                <p className="mt-5 text-lg leading-9 text-slate-600">
                  {service.description}
                </p>

                <button
                  className="
                    mt-10
                    inline-flex
                    items-center
                    gap-2
                    font-semibold
                    text-[#D4A23A]
                    transition-all
                    duration-300
                    group-hover:gap-4
                  "
                >
                  Conocer más

                  <ArrowUpRight
                    size={18}
                    className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </button>
              </div>

              <div className="absolute inset-0 bg-gradient-to-br from-[#D4A23A]/0 via-transparent to-[#D4A23A]/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
    </Section>
  );
}