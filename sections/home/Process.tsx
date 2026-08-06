import Section from "@/components/ui/Section";

const services = [
  {
    number: "01",
    title: "Constitución de Empresas",
    description:
      "Creamos LLC, Corporaciones, EIN, Operating Agreement y toda la estructura legal para comenzar correctamente.",
    icon: "🏢",
  },
  {
    number: "02",
    title: "Impuestos",
    description:
      "Preparación de impuestos personales y corporativos, planificación fiscal y cumplimiento anual.",
    icon: "📄",
  },
  {
    number: "03",
    title: "Notary Public",
    description:
      "Notarización de documentos, affidavits, poderes, contratos y certificados oficiales.",
    icon: "✍️",
  },
  {
    number: "04",
    title: "Seguros",
    description:
      "Seguros personales y comerciales para proteger tu patrimonio, empresa y familia.",
    icon: "🛡️",
  },
  {
    number: "05",
    title: "Marketing",
    description:
      "Branding, páginas web, redes sociales, Google Ads y estrategias para conseguir clientes.",
    icon: "📈",
  },
  {
    number: "06",
    title: "Consultoría Empresarial",
    description:
      "Te ayudamos a estructurar, organizar y hacer crecer tu negocio en Estados Unidos.",
    icon: "💼",
  },
];

export default function Services() {
  return (
    <Section
      id="services"
      className="bg-white py-28"
    >
      <div className="mx-auto max-w-3xl text-center">

        <span className="text-sm font-semibold uppercase tracking-[.35em] text-[#D4A23A]">
          Servicios
        </span>

        <h2 className="mt-5 text-5xl font-extrabold text-[#0D1B3D]">
          Todo lo que necesitas para crecer en Estados Unidos.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Desde la creación de tu empresa hasta la expansión de tu marca,
          centralizamos todos los servicios que un emprendedor necesita en un
          solo lugar.
        </p>

      </div>

      <div className="mt-20 grid gap-8 md:grid-cols-2">

        {services.map((service) => (

          <div
            key={service.number}
            className="
            group
            relative
            overflow-hidden
            rounded-[32px]
            border
            border-slate-200
            bg-white
            p-10
            transition-all
            duration-500
            hover:-translate-y-3
            hover:border-[#D4A23A]
            hover:shadow-[0_40px_80px_rgba(2,6,23,.12)]
            "
          >

            <div className="absolute left-0 top-0 h-1 w-0 bg-[#D4A23A] transition-all duration-500 group-hover:w-full"></div>

            <div className="flex items-center justify-between">

              <div
                className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-3xl
                bg-[#D4A23A]/10
                text-5xl
                transition-all
                duration-500
                group-hover:scale-110
                "
              >
                {service.icon}
              </div>

              <span className="text-6xl font-extrabold text-slate-100 transition-all duration-500 group-hover:text-[#D4A23A]/20">
                {service.number}
              </span>

            </div>

            <h3 className="mt-10 text-3xl font-bold text-[#0D1B3D]">
              {service.title}
            </h3>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              {service.description}
            </p>

            <div className="mt-10 flex items-center gap-3 font-semibold text-[#D4A23A]">

              <span className="transition-all duration-500 group-hover:translate-x-2">
                Conocer más
              </span>

              <span className="text-2xl transition-all duration-500 group-hover:translate-x-2">
                →
              </span>

            </div>

          </div>

        ))}

      </div>
    </Section>
  );
}