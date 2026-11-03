import Image from "next/image";

type BleedQuoteProps = { src: string; alt: string; quote: string; cite: string; position?: string };

/** Full-bleed inspiring photo with one line on top (no framed photos). */
export default function BleedQuote({ src, alt, quote, cite, position = "center" }: BleedQuoteProps) {
  return (
    <figure className="relative m-0 flex min-h-[min(70vh,620px)] items-end overflow-hidden text-white">
      <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: position }} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[var(--brand-navy)]/80 via-[var(--brand-navy)]/15 via-55% to-transparent" />
      <div className="relative mx-auto w-full max-w-[1200px] px-5 py-14">
        <blockquote className="m-0 max-w-[22ch] text-3xl font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2.6rem]">{quote}</blockquote>
        <figcaption className="mt-3.5 text-sm text-white/85">{cite}</figcaption>
      </div>
    </figure>
  );
}
