import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import HomeRoleBar from "@/sections/home/HomeRoleBar";
import ApplyOrPanelLink from "@/components/layout/ApplyOrPanelLink";
import ExplainerVideo from "@/sections/home/ExplainerVideos";
import ProBenefits from "@/sections/pro/ProBenefits";
import ProApply from "@/sections/pro/ProApply";
import AccountRoleProvider from "@/components/layout/AccountRoleProvider";
import { getPublicAccount } from "@/lib/account/public-account";

// Per request: header, role bar and buttons depend on who is signed in.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "EVOLUSA para profesionales",
  description: "Desarrolla tu marca profesional, crea contenido para tus servicios y da seguimiento a nuevas oportunidades con EVOLUSA en Florida.",
};

/**
 * The professional home (owner, 13-nov): only what a profesional gets.
 * Hero, one card per benefit, the profesional video and how to apply. The
 * usuario journey (6 etapas) and the usuario video live on the usuario home,
 * not here. No promised number of clients; "perfil aprobado", never
 * "verificado".
 */
const setupSteps = [
  {
    title: "Completa tu perfil y tus redes",
    description: "Agrega tu foto, servicios, zona, idiomas, sitio web y enlaces sociales. Define tu voz, los servicios que quieres promover y cómo quieres que te contacten.",
    href: "/panel-profesional/perfil",
    action: "Editar mi perfil",
  },
  {
    title: "Dale a la agencia el contexto de tu negocio",
    description: "En Mi marca, reúne tu identidad visual y los recursos de tu negocio. La agencia puede usar ese contexto para preparar un plan de contenido alineado con tu público y tu objetivo comercial.",
    href: "/panel-profesional/marca",
    action: "Abrir Mi marca",
  },
  {
    title: "Crea con IA y revisa tus propuestas",
    description: "Cuando la generación esté habilitada en tu cuenta, prepara borradores con tu voz y tus servicios. Revisa en el Planner la pieza, el texto y el llamado a la acción antes de aprobarlos. Puedes pedir cambios antes de publicar.",
    href: "/panel-profesional/planner",
    action: "Abrir el Planner",
  },
  {
    title: "Autoriza las redes donde quieres publicar",
    description: "Agregar un enlace a tu perfil y autorizar una cuenta son pasos distintos. Conecta los canales disponibles desde Crecimiento. La publicación depende de los permisos del canal y de la autorización de tu perfil.",
    href: "/growth-automation",
    action: "Revisar mis canales",
  },
  {
    title: "Da seguimiento y aprende qué genera negocio",
    description: "Organiza consultas, citas y cotizaciones en tu CRM. Revisa qué servicios generan interés, qué contactos siguen pendientes y qué trabajos se concretan para decidir qué promover después.",
    href: "/crm",
    action: "Abrir Clientes",
  },
] as const;

export default async function ParaProfesionalesPage() {
  const account = await getPublicAccount();
  return (
    <AccountRoleProvider account={account}>
      <SiteHeader />
      <main className="pt-24">
        <HomeRoleBar />
        <section aria-labelledby="pro-hero-title" className="relative bg-[var(--brand-navy)] text-white">
          <div className="relative aspect-[1456/1088] w-full">
            <Image src="/images/professionals/pro-hero.jpg" alt="Un profesional hispano sonríe mientras atiende a una clienta en su oficina frente a la bahía de Miami" fill priority sizes="100vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-l from-[var(--brand-navy)]/90 via-[var(--brand-navy)]/45 via-45% to-transparent to-65% lg:block" />
          </div>
          <div className="px-5 py-12 lg:absolute lg:inset-0 lg:flex lg:items-center lg:justify-end lg:px-[clamp(2rem,6vw,7rem)] lg:py-10">
            <div className="max-w-[540px]">
              <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] text-[#ff7a87]"><span aria-hidden className="h-[3px] w-8 rounded-full bg-current" />Para profesionales en Florida</p>
              <h1 id="pro-hero-title" className="mt-4 text-[2.2rem] font-bold leading-[1.12] tracking-[-0.02em] sm:text-[2.75rem] xl:text-[3.25rem]">
                Haz crecer tu marca y convierte consultas en clientes.
              </h1>
              <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/90">EVOLUSA conecta tu perfil público, tu estrategia de contenido y el seguimiento de tus prospectos. Así, quien descubre tu trabajo puede entender qué ofreces, contactarte y avanzar hacia una cita o cotización.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ApplyOrPanelLink label="Solicitar mi ingreso" className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-7 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#a90016]" />
                <Link href="#lo-que-recibes" className="inline-flex min-h-14 items-center rounded-full px-7 font-bold text-white ring-2 ring-inset ring-white/70 transition hover:bg-white/10">Ver lo que recibes</Link>
                <Link href="#primeros-pasos" className="inline-flex min-h-14 items-center rounded-full px-4 font-bold text-white underline underline-offset-4">Cómo empezar</Link>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/90">
                <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Perfil con tu marca</li>
                <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Contenido y prospectos</li>
                <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Español primero</li>
              </ul>
            </div>
          </div>
        </section>

        <ProBenefits />
        <section id="primeros-pasos" aria-labelledby="setup-title" className="scroll-mt-24 border-b border-[var(--border)] bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-5">
            <h2 id="setup-title" className="text-3xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-4xl">
              De configurar tu marca a generar negocio
            </h2>
            <p className="mt-3 max-w-[70ch] text-lg text-[var(--muted)]">
              La agencia autónoma de EvolUSA ayuda a preparar propuestas y organizar el trabajo por perfil. Tú defines tus prioridades, decides qué se aprueba y atiendes las oportunidades.
            </p>
            <ol className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {setupSteps.map(({ title, description, href, action }, index) => (
                <li key={title} className="flex gap-4 py-5 sm:gap-6">
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--role-pro-soft)] font-bold text-[var(--brand-navy)]">{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--brand-navy)]">{title}</h3>
                    <p className="mt-1 max-w-[74ch] leading-relaxed text-[var(--muted)]">{description}</p>
                    {(account.role === "PROFESSIONAL" || account.role === "ADMIN") && (
                      <Link href={href} className="mt-2 inline-flex min-h-11 items-center font-bold text-[var(--brand-red-strong)] underline underline-offset-4">{action}</Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section aria-labelledby="example-title" className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-5">
            <h2 id="example-title" className="text-3xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-4xl">
              De una publicación a una cita
            </h2>
            <p className="mt-3 max-w-[65ch] text-lg text-[var(--muted)]">
              Ejemplo para una notaria móvil en Miami. El mismo recorrido se adapta a los servicios y objetivos de tu negocio.
            </p>
            <ol className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                ["Presenta un servicio claro", "Tu perfil explica que haces visitas a domicilio, qué zonas cubres y cómo solicitar una cita."],
                ["Responde una duda frecuente", "Planeas un reel sobre qué preparar antes de una cita. La publicación invita a pedir disponibilidad."],
                ["Da seguimiento a la consulta", "Registras el contacto, confirmas qué necesita y acuerdas la cita y el precio. En el panel ves quién sigue pendiente de respuesta."],
              ].map(([title, description]) => (
                <li key={title} className="rounded-2xl border border-[var(--border)] p-6">
                  <h3 className="text-xl font-bold text-[var(--brand-navy)]">{title}</h3>
                  <p className="mt-2 leading-relaxed text-[var(--muted)]">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <ExplainerVideo kind="profesional" />
        <ProApply />
      </main>
      <Footer />
    </AccountRoleProvider>
  );
}
