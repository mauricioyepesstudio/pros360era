import Link from "next/link";
import BrandMark from "@/components/evolusa/BrandMark";
import Container from "@/components/ui/Container";

const footerLinks = [{ label: "Etapas", href: "#stage-selector" }, { label: "Journey", href: "#journey" }, { label: "Servicios", href: "#stage-services" }, { label: "Roadmap", href: "#roadmap" }, { label: "Profesionales", href: "/profesionales" }, { label: "Preguntas", href: "#faq" }] as const;

export default function Footer() {
  return <footer className="bg-[var(--brand-navy-strong)] text-white"><Container className="py-14"><div className="grid gap-10 md:grid-cols-2 md:items-start"><div><BrandMark theme="dark" showTagline /><p className="mt-5 max-w-xl leading-7 text-slate-400">Una plataforma de progreso y orientación en español para identificar y organizar tu próximo paso en Estados Unidos.</p></div><nav className="md:justify-self-end" aria-label="Navegación de pie de página"><ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-300">{footerLinks.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-white">{item.label}</Link></li>)}</ul></nav></div><div className="mt-12 border-t border-white/10 pt-6 text-xs leading-5 text-slate-500"><p>EVOLUSA no es una agencia gubernamental. La orientación general no sustituye asesoría profesional. Datos legales y canales de contacto pendientes de verificación.</p><p className="mt-3">© {new Date().getFullYear()} EVOLUSA. Nombre legal por confirmar.</p></div></Container></footer>;
}
