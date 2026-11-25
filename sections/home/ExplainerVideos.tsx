/**
 * One explainer video per side of the site (owner, 13-nov): the usuario video
 * lives on the usuario home and the profesional video on /para-profesionales.
 * No toggle: each audience only sees its own video. Wide on desktop, vertical
 * on phones; preload="none" so nothing downloads until play.
 */
const videos = {
  usuario: {
    eyebrow: "En video",
    heading: "Mira cómo funciona tu camino",
    title: "Tu camino en Estados Unidos, paso a paso",
    body: "Las 6 etapas de EVOLUSA y cómo conectas con un profesional de perfil aprobado cuando lo necesitas.",
    accent: "var(--role-member)",
    eyebrowColor: "text-[var(--brand-blue-on-dark)]",
  },
  profesional: {
    eyebrow: "En video",
    heading: "Mira tu panel profesional por dentro",
    title: "Tu negocio, con un sistema detrás",
    body: "Tu perfil aprobado, tu planner de publicaciones y los prospectos de tus redes en un solo panel.",
    accent: "var(--brand-red)",
    eyebrowColor: "text-[#ff7a87]",
  },
} as const;

export type ExplainerVideoKind = keyof typeof videos;

export default function ExplainerVideo({ kind }: { kind: ExplainerVideoKind }) {
  const v = videos[kind];
  return (
    <section id="video" aria-labelledby={`video-title-${kind}`} data-video={kind} className="scroll-mt-24 bg-[var(--brand-navy)] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <p className={`flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] ${v.eyebrowColor}`}>
          <span aria-hidden className="h-[3px] w-7 rounded-full bg-current" />{v.eyebrow}
        </p>
        <h2 id={`video-title-${kind}`} className="mt-3 text-balance text-4xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-5xl">
          {v.heading}
        </h2>
        <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-3xl bg-black shadow-2xl ring-1 ring-white/10">
            <video className="hidden aspect-video w-full sm:block" controls playsInline preload="none" poster={`/videos/${kind}-16x9.jpg`} aria-label={v.title}>
              <source src={`/videos/${kind}-16x9.mp4`} type="video/mp4" />
            </video>
            <video className="mx-auto block aspect-[9/16] w-full max-w-[420px] sm:hidden" controls playsInline preload="none" poster={`/videos/${kind}-9x16.jpg`} aria-label={v.title}>
              <source src={`/videos/${kind}-9x16.mp4`} type="video/mp4" />
            </video>
          </div>
          <div>
            <span aria-hidden className="block h-1.5 w-12 rounded-full" style={{ background: v.accent }} />
            <h3 className="mt-5 text-2xl font-bold">{v.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-white/75">{v.body}</p>
            <p className="mt-6 text-sm text-white/60">Con voz y subtítulos.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
