import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";

export default function CTA() {
  return (
    <Section
      id="contact"
      className="bg-[#D4A23A] py-28"
    >
      <div className="mx-auto max-w-6xl rounded-[40px] bg-[#0D1B3D] px-10 py-16 text-center shadow-2xl">

        <span className="inline-block rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-[#D4A23A]">
          Comienza Hoy
        </span>

        <h2 className="mt-6 text-5xl font-bold text-white">
          Construyamos tu futuro juntos.
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-slate-300">
          Agenda una consulta gratuita y descubre cómo PROS360ERA puede ayudarte
          a crear, proteger y hacer crecer tu negocio en Estados Unidos.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-5">

          <Button>
            Agenda Gratis
          </Button>

          <a
            href="https://wa.me/17866041733"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary">
              Hablar por WhatsApp
            </Button>
          </a>

        </div>

      </div>
    </Section>
  );
}