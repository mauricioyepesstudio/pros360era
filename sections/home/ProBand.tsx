import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Navy invitation for professionals; the full pitch lives at /para-profesionales. */
const kit = ["Solicitudes de tu nicho", "Tu perfil profesional", "Tu CRM de clientes", "Tus redes, planeadas y publicadas", "Ves qué te funciona"] as const;

export default function ProBand() {
  return (
    <section id="para-profesionales" aria-labelledby="pro-band-title" className="scroll-mt-20 bg-[var(--brand-navy)] py-20 text-white sm:py-24">
      <div className="mx-auto grid max-w-[1200px] items-end gap-10 px-5 md:grid-cols-[1.2fr_1fr] md:gap-14">
        <div>
          <Image src="/brand/evolusa-wordmark-reverse.png" alt="EVOLUSA" width={552} height={296} className="mb-6 h-9 w-auto object-contain object-left" />
          <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] text-[#ff7a87]">
            <span aria-hidden className="h-[3px] w-7 rounded-full bg-current" />Para profesionales
          </p>
          <h2 id="pro-band-title" className="mt-3 text-balance text-4xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-5xl">¿Atiendes a hispanos en Florida? Aquí te encuentran.</h2>
          <p className="mt-4 max-w-[52ch] text-lg text-white/85">Tu página, tus redes, tus clientes y solicitudes de tu nicho, en un solo lugar.</p>
          <Link href="/para-profesionales" className="mt-8 inline-flex min-h-14 items-center gap-2 rounded-full bg-[var(--brand-red-strong)] px-7 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#a90016]">
            Ver lo que recibes <ArrowRight aria-hidden size={18} />
          </Link>
        </div>
        <ol className="border-t border-white/20">
          {kit.map((item, index) => (
            <li key={item} className="flex justify-between gap-4 border-b border-white/20 py-4 text-[17px] font-semibold">
              {item}
              <span aria-hidden className="font-extrabold text-[#ff7a87]">{String(index + 1).padStart(2, "0")}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
