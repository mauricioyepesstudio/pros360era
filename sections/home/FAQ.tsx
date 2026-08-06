import { ChevronDown } from "lucide-react";
import Section from "@/components/ui/Section";

const faqs = [
  {
    question: "¿Qué servicios ofrece PROS360ERA?",
    answer:
      "Creación de empresas, impuestos, ITIN, notarización, seguros, marketing digital y consultoría empresarial.",
  },
  {
    question: "¿Atienden completamente en español?",
    answer:
      "Sí. Todo nuestro equipo brinda atención en español durante cada etapa del proceso.",
  },
  {
    question: "¿Necesito una cita?",
    answer:
      "Sí. Recomendamos agendar una consulta gratuita para conocer tu caso y ofrecerte la mejor solución.",
  },
  {
    question: "¿Atienden empresas ya existentes?",
    answer:
      "Sí. Ayudamos tanto a nuevos emprendedores como a empresas establecidas.",
  },
];

export default function FAQ() {
  return (
    <Section
      className="bg-[#F8FAFC] py-28"
      id="faq"
    >
      <div className="mx-auto max-w-3xl text-center">

        <span className="inline-block rounded-full bg-[#D4A23A]/10 px-5 py-2 text-sm font-semibold text-[#D4A23A]">
          Preguntas Frecuentes
        </span>

        <h2 className="mt-6 text-5xl font-bold text-[#0D1B3D]">
          Resolvemos tus dudas.
        </h2>

        <p className="mt-6 text-xl leading-9 text-slate-600">
          Antes de comenzar, estas son las preguntas que recibimos con mayor frecuencia.
        </p>

      </div>

      <div className="mx-auto mt-20 max-w-5xl space-y-5">

        {faqs.map((faq) => (

          <div
            key={faq.question}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg"
          >

            <div className="flex items-center justify-between">

              <h3 className="text-xl font-semibold text-[#0D1B3D]">
                {faq.question}
              </h3>

              <ChevronDown
                size={22}
                className="text-[#D4A23A]"
              />

            </div>

            <p className="mt-5 leading-8 text-slate-600">
              {faq.answer}
            </p>

          </div>

        ))}

      </div>

    </Section>
  );
}
