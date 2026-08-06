import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden"
    >
      {/* Fondo */}
      <img
        src="/images/hero/hero-family.webp"
        alt="PROS360ERA"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay para mejorar lectura */}
      <div className="absolute inset-0 bg-[#07142F]/45" />

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 sm:px-10 lg:px-16">

        <div className="max-w-2xl">

          <span className="inline-flex rounded-full border border-[#D4A23A] px-5 py-2 text-sm font-semibold text-[#D4A23A]">
            Multiservicios para inmigrantes y emprendedores
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight text-white md:text-7xl">
            Impulsamos tu
            <br />
            futuro en
            <br />
            Estados Unidos.
          </h1>

          <p className="mt-8 max-w-xl text-xl leading-9 text-white/90">
            Creamos empresas, impuestos, notaría, seguros y marketing para ayudarte
            a crecer legalmente en Estados Unidos.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">

            <Button>
              Agenda Gratis
            </Button>

            <a
              href="https://wa.me/17866041733"
              target="_blank"
            >
              <Button variant="secondary">
                WhatsApp
              </Button>
            </a>

          </div>

          <div className="mt-14 flex flex-wrap gap-10">

            <div>
              <p className="text-4xl font-bold text-[#D4A23A]">
                500+
              </p>
              <p className="text-white">
                Clientes
              </p>
            </div>

            <div>
              <p className="text-4xl font-bold text-[#D4A23A]">
                15+
              </p>
              <p className="text-white">
                Servicios
              </p>
            </div>

            <div>
              <p className="text-4xl font-bold text-[#D4A23A]">
                100%
              </p>
              <p className="text-white">
                En Español
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
