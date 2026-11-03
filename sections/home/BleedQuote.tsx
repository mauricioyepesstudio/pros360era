import Image from "next/image";

type BleedQuoteProps = { src: string; alt: string; quote: string; cite: string; photoSide?: "left" | "right" };

/**
 * Full-bleed photo + quote, split (owner feedback 3-nov): the photo keeps
 * its 4:3 shape so nobody gets cropped, and the line sits on navy beside it,
 * never on top of the photo.
 */
export default function BleedQuote({ src, alt, quote, cite, photoSide = "left" }: BleedQuoteProps) {
  return (
    <figure className="m-0 grid bg-[var(--brand-navy)] text-white lg:min-h-[37.5vw] lg:grid-cols-2">
      <div className={`relative aspect-[4/3] lg:aspect-auto ${photoSide === "right" ? "lg:order-2" : ""}`}>
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="flex items-center px-5 py-12 lg:px-[clamp(2rem,5vw,6rem)]">
        <div>
          <span aria-hidden className="block h-1 w-12 rounded-full bg-[var(--brand-red)]" />
          <blockquote className="m-0 mt-6 max-w-[20ch] text-balance text-3xl font-bold leading-[1.18] tracking-[-0.02em] sm:text-[2.5rem]">{quote}</blockquote>
          <figcaption className="mt-4 text-sm text-white/80">{cite}</figcaption>
        </div>
      </div>
    </figure>
  );
}
