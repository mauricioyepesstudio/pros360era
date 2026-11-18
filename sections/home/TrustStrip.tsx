import { CircleCheck, LockKeyhole, MessageSquareText, ShieldCheck } from "lucide-react";

/**
 * Trust signals right under the hero (UI/UX Pro Max: avoid low trust
 * signals). Only true, non-promissory statements; no testimonials until real
 * ones exist and pass compliance-reviewer.
 */
const items = [
  { icon: ShieldCheck, title: "Perfiles revisados uno a uno", body: "Antes de publicarse como perfil aprobado" },
  { icon: MessageSquareText, title: "Todo en español", body: "Desde la primera pregunta" },
  { icon: CircleCheck, title: "Empiezas gratis", body: "Sin tarjeta para ver tu camino" },
  { icon: LockKeyhole, title: "Tus datos, protegidos", body: "No pedimos números de identificación" },
] as const;

export default function TrustStrip() {
  return (
    <div className="border-b border-[var(--border)] bg-white">
      <ul className="mx-auto grid max-w-[1200px] gap-6 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex items-start gap-3.5">
            <Icon aria-hidden className="mt-0.5 shrink-0 text-[var(--brand-red-strong)]" size={26} />
            <span>
              <span className="block text-[15px] font-bold text-[var(--brand-navy)]">{title}</span>
              <span className="block text-sm leading-snug text-[var(--muted)]">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
