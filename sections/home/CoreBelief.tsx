import Container from "@/components/ui/Container";

/**
 * The "clarity" beat in the home narrative (aspiration → identification →
 * clarity → path → personalization → action). Deliberately a plain
 * statement, not a card or a Heading+eyebrow pattern — the point is one
 * uninterrupted editorial moment between the stage selector and the path.
 */
export default function CoreBelief() {
  return (
    <section aria-label="Nuestra idea central" className="bg-[var(--background)] py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-balance text-3xl font-bold leading-tight tracking-[-0.02em] text-[var(--brand-navy)] sm:text-5xl">No tienes que resolverlo todo hoy.</p>
          <p className="mt-4 text-balance text-2xl font-semibold leading-tight text-[var(--muted)] sm:text-4xl">Solo necesitas saber cuál es el siguiente paso.</p>
        </div>
      </Container>
    </section>
  );
}
