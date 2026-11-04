"use client";

import { useState } from "react";

/**
 * Explainer videos (4-nov): one for users, one for professionals, with
 * voice-over and burned-in subtitles. Wide video on
 * desktop, vertical on phones; preload="none" so nothing downloads until play.
 */
const videos = {
  usuario: {
    tab: "Soy usuario",
    title: "Tu camino en Estados Unidos, paso a paso",
    body: "Las 6 etapas de EVOLUSA y cómo conectas con un profesional de perfil aprobado cuando lo necesitas.",
    accent: "var(--brand-blue)",
  },
  profesional: {
    tab: "Soy profesional",
    title: "Tu negocio, con un sistema detrás",
    body: "Tu perfil aprobado, tu planner de publicaciones y los prospectos de tus redes en un solo panel.",
    accent: "var(--brand-red-strong)",
  },
} as const;

type Key = keyof typeof videos;

export default function ExplainerVideos() {
  const [active, setActive] = useState<Key>("usuario");
  const v = videos[active];
  return (
    <section id="video" aria-labelledby="video-title" className="scroll-mt-20 bg-[var(--brand-navy)] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <p className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--brand-gold)]">
          <span aria-hidden className="h-[3px] w-7 rounded-full bg-current" />En video
        </p>
        <h2 id="video-title" className="mt-3 text-balance text-4xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-5xl">
          Mira cómo funciona <span className="text-[var(--brand-red)]">EVOLUSA</span>.
        </h2>
        <div role="tablist" aria-label="Elige tu video" className="mt-10 inline-flex rounded-full bg-white/10 p-1.5">
          {(Object.keys(videos) as Key[]).map((key) => (
            <button
              key={key}
              role="tab"
              id={`video-tab-${key}`}
              aria-selected={active === key}
              aria-controls="video-panel"
              onClick={() => setActive(key)}
              className={`min-h-12 rounded-full px-6 text-sm font-bold transition sm:text-base ${active === key ? "bg-white text-[var(--brand-navy)]" : "text-white/80 hover:text-white"}`}
            >
              {videos[key].tab}
            </button>
          ))}
        </div>
        <div id="video-panel" role="tabpanel" aria-labelledby={`video-tab-${active}`} className="mt-8 grid items-center gap-8 lg:grid-cols-[1fr_320px]">
          <div key={active} className="overflow-hidden rounded-3xl bg-black shadow-2xl ring-1 ring-white/10">
            <video
              className="hidden aspect-video w-full sm:block"
              controls
              playsInline
              preload="none"
              poster={`/videos/${active}-16x9.jpg`}
              aria-label={v.title}
            >
              <source src={`/videos/${active}-16x9.mp4`} type="video/mp4" />
            </video>
            <video
              className="mx-auto block aspect-[9/16] w-full max-w-[420px] sm:hidden"
              controls
              playsInline
              preload="none"
              poster={`/videos/${active}-9x16.jpg`}
              aria-label={v.title}
            >
              <source src={`/videos/${active}-9x16.mp4`} type="video/mp4" />
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
