import { ShieldCheck, Clock3, Languages } from "lucide-react";
import Section from "@/components/ui/Section";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Todo en un solo lugar",
    detail:
      "Empresa, impuestos, ITIN, notary, seguros y marketing. Un solo equipo para ayudarte a crecer.",
  },
  {
    icon: Clock3,
    title: "Procesos rápidos",
    detail:
      "Digitalizamos cada trámite para reducir tiempos y mantenerte informado durante todo el proceso.",
  },
  {
    icon: Languages,
    title: "Atención 100% en Español",
    detail:
      "Te explicamos cada paso de forma clara para que tomes decisiones con confianza.",
  },
];

export default function Benefits() {
  return (
    <Section
      id="about"
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-3xl text-center">

        <span className="inline-block rounded-full bg-[#D4A23A]/10 px-5 py-2 text-sm font-semibold text-[#D4A23A]">
          ¿Por qué elegirnos?
        </span>

        <h2 className="mt-6 text-5xl font-bold text-[#0D1B3D]">
          Más que un proveedor,
          <br />
          somos tu aliado.
        </h2>

        <p className="mt-6 text-xl leading-9 text-slate-600">
          Acompañamos a inmigrantes y emprendedores durante todo su crecimiento
          en Estados Unidos.
        </p>

      </div>

      <div className="mt-20 grid gap-8 lg:grid-cols-3">

        {benefits.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-[30px] border border-slate-200 bg-white p-10 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4A23A]/10">
                <Icon
                  size={30}
                  className="text-[#D4A23A]"
                />
              </div>

              <h3 className="mt-8 text-2xl font-bold text-[#0D1B3D]">
                {item.title}
              </h3>

              <p className="mt-5 leading-8 text-slate-600">
                {item.detail}
              </p>
            </div>
          );
        })}

      </div>
    </Section>
  );
}