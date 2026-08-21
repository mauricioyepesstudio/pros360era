import Section from "@/components/ui/Section";
import { brand } from "@/config/brand";
import {
  BadgeCheck,
  Users,
  Clock3,
  Handshake,
} from "lucide-react";

const items = [
  {
    icon: BadgeCheck,
    title: "Experiencia comprobada",
    text: "Acompañamos emprendedores y familias durante todo el proceso legal, fiscal y empresarial.",
  },
  {
    icon: Users,
    title: "Atención personalizada",
    text: "No eres un número. Analizamos tu caso y diseñamos la mejor estrategia para ti.",
  },
  {
    icon: Clock3,
    title: "Procesos ágiles",
    text: "Reducimos tiempos gracias a procesos digitales y un equipo especializado.",
  },
  {
    icon: Handshake,
    title: "Un solo aliado",
    text: "Empresa, impuestos, seguros, notaría y marketing desde un mismo lugar.",
  },
];

export default function Benefits() {
  return (
    <Section className="bg-[#0D1B3D] py-32">

      <div className="mx-auto max-w-3xl text-center">

        <span className="text-sm font-semibold uppercase tracking-[.35em] text-[#D4A23A]">
          ¿POR QUÉ {brand.name}?
        </span>

        <h2 className="mt-5 text-5xl font-extrabold leading-tight text-white">
          Más que servicios,
          <br />
          construimos tranquilidad.
        </h2>

        <p className="mt-6 text-xl leading-8 text-slate-300">
          Nuestro objetivo es que puedas concentrarte en hacer crecer tu negocio
          mientras nosotros nos ocupamos del resto.
        </p>

      </div>

      <div className="mt-20 grid gap-8 md:grid-cols-2">

        {items.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="
              group
              rounded-[32px]
              border
              border-white/10
              bg-white/5
              p-10
              backdrop-blur-md
              transition-all
              duration-500
              hover:-translate-y-2
              hover:border-[#D4A23A]
              hover:bg-white/10
              "
            >

              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#D4A23A]/15 transition-all duration-500 group-hover:bg-[#D4A23A]">

                <Icon
                  className="h-10 w-10 text-[#D4A23A] transition-all duration-500 group-hover:text-white"
                  strokeWidth={2}
                />

              </div>

              <h3 className="mt-8 text-3xl font-bold text-white">
                {item.title}
              </h3>

              <p className="mt-5 text-lg leading-8 text-slate-300">
                {item.text}
              </p>

            </div>

          );

        })}

      </div>

    </Section>
  );
}