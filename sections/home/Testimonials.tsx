import { Star } from "lucide-react";
import Section from "@/components/ui/Section";

const testimonials = [
  {
    name: "Lucía P.",
    role: "Propietaria de Tienda Online",
    quote:
      "Abrir mi LLC fue mucho más sencillo de lo que imaginaba. Todo el proceso fue claro, rápido y completamente en español.",
  },
  {
    name: "Miguel R.",
    role: "Empresario",
    quote:
      "Ahora llevamos nuestra contabilidad e impuestos con un solo equipo. Nos ahorran tiempo y nos dan tranquilidad.",
  },
  {
    name: "Karina S.",
    role: "Agente Inmobiliaria",
    quote:
      "Necesitaba seguros, notary y asesoría para mi empresa. Encontré todo en un solo lugar y el servicio ha sido excelente.",
  },
];

export default function Testimonials() {
  return (
    <Section className="bg-white py-28">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-block rounded-full bg-[#D4A23A]/10 px-5 py-2 text-sm font-semibold text-[#D4A23A]">
          Testimonios
        </span>

        <h2 className="mt-6 text-5xl font-bold text-[#0D1B3D]">
          Lo que dicen nuestros clientes.
        </h2>

        <p className="mt-6 text-xl leading-9 text-slate-600">
          Nuestro compromiso es brindar soluciones claras, rápidas y
          profesionales para cada cliente.
        </p>
      </div>

      <div className="mt-20 grid gap-8 lg:grid-cols-3">
        {testimonials.map((item) => (
          <div
            key={item.name}
            className="rounded-[30px] border border-slate-200 bg-white p-10 shadow-xl transition duration-300 hover:-translate-y-2"
          >
            <div className="mb-6 flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className="fill-[#D4A23A] text-[#D4A23A]"
                />
              ))}
            </div>

            <p className="leading-8 text-slate-600">
              &ldquo;{item.quote}&rdquo;
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0D1B3D] text-lg font-bold text-white">
                {item.name.charAt(0)}
              </div>

              <div>
                <h3 className="font-bold text-[#0D1B3D]">
                  {item.name}
                </h3>

                <p className="text-sm text-slate-500">
                  {item.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
