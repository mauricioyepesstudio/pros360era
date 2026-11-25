import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/sections/home/Footer";
import { PROFESSIONAL_PLANS, PROFESSIONAL_BILLING_ENABLED } from "@/lib/professional-plans";

export const metadata: Metadata = {
  title: "Planes para profesionales | EVOLUSA",
  description: "Conoce el piloto gratuito y los planes propuestos para profesionales en EVOLUSA.",
};

export default function PlanesProfesionalesPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50 pb-20 pt-36">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--brand-red-strong)]">Programa para profesionales</p>
          <h1 className="mt-4 text-4xl font-bold text-[var(--brand-navy)] sm:text-5xl">Crece con EVOLUSA</h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">Estamos validando el servicio con profesionales piloto. Durante el piloto no cobramos suscripciones. Los siguientes precios son propuestas para después de validar el servicio; todavía no están disponibles para contratar.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PROFESSIONAL_PLANS.map((plan) => (
              <section key={plan.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[var(--brand-navy)]">{plan.name}</h2>
                <p className="mt-4 text-4xl font-extrabold text-[var(--brand-navy)]">${plan.monthlyUsd}<span className="text-sm font-medium text-slate-500">/mes</span></p>
                <p className="mt-4 min-h-16 text-sm text-slate-600">{plan.description}</p>
                <ul className="mt-5 flex-1 space-y-3 border-t border-slate-100 pt-5">
                  {plan.features.map((feature) => <li key={feature} className="text-sm text-slate-700">✓ {feature}</li>)}
                </ul>
              </section>
            ))}
          </div>
          <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-[var(--brand-navy)]">Participa en el piloto</h2>
            <p className="mt-2 text-slate-600">La participación requiere aprobación del perfil. No garantizamos clientes, ingresos ni posicionamiento preferente. Los costos externos de mensajería, anuncios, dominios o consumo de IA no están incluidos. Los beneficios de fundador se definirán antes de activar cualquier cobro.</p>
            <Link href="/aplicar-profesional" className="mt-6 inline-flex rounded-full bg-[var(--brand-red-strong)] px-6 py-3 font-bold text-white">Solicitar acceso al piloto</Link>
            {!PROFESSIONAL_BILLING_ENABLED && <p className="mt-4 text-sm text-slate-500">Cobros desactivados: no se solicitará información de pago desde esta página.</p>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
