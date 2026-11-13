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

export const metadata: Metadata = {
  title: "EVOLUSA para profesionales",
  description: "Tu página profesional, tus redes, un CRM para tus clientes y solicitudes de hispanos en Florida que buscan tu servicio.",
};

/**
 * The professional home (owner, 13-nov): only what a profesional gets.
 * Hero, one card per benefit, the profesional video and how to apply. The
 * usuario journey (6 etapas) and the usuario video live on the usuario home,
 * not here. No promised number of clients; "perfil aprobado", never
 * "verificado".
 */
export default function ParaProfesionalesPage() {
  return (
    <>
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
                Tú atiendes.<br />Nosotros te ayudamos a que te encuentren.
              </h1>
              <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/90">Al registrarte recibes tu página profesional, tus redes planeadas, un CRM para tus clientes y solicitudes de tu nicho cuando alguien busca lo que tú haces.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ApplyOrPanelLink label="Aplicar en 5 minutos" className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-7 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#a90016]" />
                <Link href="#lo-que-recibes" className="inline-flex min-h-14 items-center rounded-full px-7 font-bold text-white ring-2 ring-inset ring-white/70 transition hover:bg-white/10">Ver lo que recibes</Link>
                <Link href="#video" className="inline-flex min-h-14 items-center rounded-full px-4 font-bold text-white underline underline-offset-4">Ver el video</Link>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/90">
                <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Un nicho definido</li>
                <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Todo en un panel</li>
                <li><span aria-hidden className="mr-1.5 font-black text-[#ff7a87]">✓</span>Español primero</li>
              </ul>
            </div>
          </div>
        </section>

        <ProBenefits />
        <ExplainerVideo kind="profesional" />
        <ProApply />
      </main>
      <Footer />
    </>
  );
}
