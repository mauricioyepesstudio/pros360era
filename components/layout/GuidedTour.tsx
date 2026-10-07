"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Compass, Hand, X } from "lucide-react";

/**
 * Recorrido guiado del home: un pop-up animado que resalta, uno por uno, los
 * botones del hero (`data-tour="..."`). Funciona igual en HeroArtboard
 * (escritorio) y Hero (móvil): para cada paso usa el primer elemento visible
 * con ese data-tour y salta los pasos que no se ven en la pantalla actual.
 *
 * La invitación sale sola una vez por navegador (localStorage); después el
 * botón flotante "Recorrido guiado" permite repetirlo. Copy revisado contra
 * data/compliance/claims.ts: "profesionales aprobados", sin cifras.
 */

type TourStep = { target: string; title: string; body: string };

const steps: TourStep[] = [
  {
    target: "hero-pro",
    title: "¿Ofreces un servicio?",
    body: "Toca “Soy profesional” para enviar tu solicitud. La solicitud, la preparación del perfil y su publicación son pasos separados.",
  },
  {
    target: "hero-busco",
    title: "¿Buscas ayuda?",
    body: "En “Busco un profesional” ves los perfiles aprobados y eliges con quién hablar.",
  },
  {
    target: "hero-login",
    title: "¿Ya te registraste?",
    body: "Elige la entrada de usuario o profesional para continuar en tu espacio con la misma cuenta.",
  },
  {
    target: "hero-path",
    title: "Tu camino en seis etapas",
    body: "Llega, Establécete, Emprende, Protégete, Crece y Evoluciona. EVOLUSA te ubica en la tuya y te muestra qué sigue.",
  },
  {
    target: "hero-roadmap",
    title: "Tu plan EVOLUSA",
    body: "Qué hacer hoy, qué sigue y qué viene después, en pasos cortos.",
  },
  {
    target: "hero-como-funciona",
    title: "¿Lo quieres ver paso a paso?",
    body: "Aquí te explicamos cómo funciona, tanto si buscas asesoría como si eres profesional.",
  },
];

const STORAGE_KEY = "evolusa-tour-v1";
const PAD = 8;

function readSeen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "done";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "done");
  } catch {
    /* sin almacenamiento: el recorrido simplemente puede volver a ofrecerse */
  }
}

function findVisible(target: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`);
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0 && node.getClientRects().length > 0) return node;
  }
  return null;
}

type Rect = { top: number; left: number; width: number; height: number };

export default function GuidedTour() {
  const [phase, setPhase] = useState<"idle" | "invite" | "touring">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const nextRef = useRef<HTMLButtonElement>(null);

  // Solo los pasos cuyo elemento existe y se ve en esta pantalla.
  const [activeSteps, setActiveSteps] = useState<TourStep[]>(steps);


  const close = useCallback(() => {
    markSeen();
    setPhase("idle");
    setRect(null);
  }, []);

  const start = useCallback(() => {
    const available = steps.filter((s) => findVisible(s.target));
    if (available.length === 0) return close();
    setActiveSteps(available);
    setStepIndex(0);
    setPhase("touring");
  }, [close]);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tour") === "start";
    const timer = !readSeen() || requested ? window.setTimeout(start, 1800) : undefined;
    window.addEventListener("evolusa:start-tour", start);
    return () => { window.clearTimeout(timer); window.removeEventListener("evolusa:start-tour", start); };
  }, [start]);

  const step = phase === "touring" ? activeSteps[stepIndex] : undefined;

  // Lleva el elemento al centro y sigue su posición mientras dura el paso.
  useLayoutEffect(() => {
    if (!step) return;
    const el = findVisible(step.target);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });

    let frame = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect((prev) =>
        prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height
          ? prev
          : { top: r.top, left: r.left, width: r.width, height: r.height },
      );
      setViewport((prev) => (prev.w === window.innerWidth && prev.h === window.innerHeight ? prev : { w: window.innerWidth, h: window.innerHeight }));
      frame = window.requestAnimationFrame(measure);
    };
    measure();
    return () => window.cancelAnimationFrame(frame);
  }, [step]);

  useEffect(() => {
    if (phase !== "touring") return;
    nextRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setStepIndex((i) => Math.min(i + 1, activeSteps.length - 1));
      if (e.key === "ArrowLeft") setStepIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, stepIndex, activeSteps.length, close]);

  const isLast = stepIndex === activeSteps.length - 1;

  // Tarjeta debajo del elemento si cabe; si no, encima. Centrada y dentro de la pantalla.
  const CARD_W = Math.min(340, Math.max(viewport.w - 32, 0));
  let cardPos: { top?: number; bottom?: number } = {};
  let cardLeft = 0;
  let below = true;
  if (rect) {
    const spaceBelow = viewport.h - (rect.top + rect.height);
    below = spaceBelow > 230 || spaceBelow > rect.top;
    cardPos = below ? { top: rect.top + rect.height + PAD + 18 } : { bottom: viewport.h - rect.top + PAD + 18 };
    cardLeft = Math.min(Math.max(rect.left + rect.width / 2 - CARD_W / 2, 16), viewport.w - CARD_W - 16);
  }

  return (
    <>
      {/* Botón flotante para repetir el recorrido */}
      <AnimatePresence>
        {phase === "idle" && (
          <motion.button
            type="button"
            onClick={start}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-5 left-5 z-[60] inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--brand-navy)] px-4 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgb(4_15_34_/_0.6)] ring-1 ring-white/15 transition hover:-translate-y-0.5"
          >
            <Compass aria-hidden size={18} />
            Recorrido guiado
          </motion.button>
        )}
      </AnimatePresence>

      {/* Invitación inicial */}
      <AnimatePresence>
        {phase === "invite" && (
          <motion.div
            role="dialog"
            aria-labelledby="tour-invite-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed bottom-5 left-4 right-4 z-[70] mx-auto max-w-sm rounded-[var(--radius-lg)] bg-white p-5 text-[var(--brand-navy)] shadow-[0_24px_60px_-20px_rgb(4_15_34_/_0.55)] sm:left-5 sm:right-auto"
          >
            <button type="button" onClick={close} aria-label="Cerrar" className="absolute right-3 top-3 rounded-full p-1.5 text-[var(--muted)] hover:bg-[var(--surface-subtle)]">
              <X size={18} aria-hidden />
            </button>
            <div className="flex items-center gap-3">
              <motion.span
                aria-hidden
                animate={{ rotate: [0, 14, -8, 14, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2 }}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--brand-red)] text-white"
              >
                <Hand size={22} />
              </motion.span>
              <div>
                <p id="tour-invite-title" className="text-base font-extrabold">¿Primera vez en EVOLUSA?</p>
                <p className="text-sm text-[var(--muted)]">Conoce las entradas y los pasos de EVOLUSA.</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={start} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--brand-red)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-red-strong)]">
                Empezar recorrido
                <ArrowRight aria-hidden className="ml-2" size={16} />
              </button>
              <button type="button" onClick={close} className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] px-4 text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--surface-subtle)]">
                Ahora no
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recorrido */}
      <AnimatePresence>
        {phase === "touring" && step && rect && (
          <motion.div key="tour" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-[70]">
            {/* Foco: oscurece todo menos el botón resaltado (que sigue siendo clicable) */}
            <motion.div
              aria-hidden
              className="absolute rounded-[1.25rem]"
              animate={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }}
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
              style={{ boxShadow: "0 0 0 9999px rgb(4 15 34 / 0.62)" }}
            />
            {/* Anillo que late alrededor del botón */}
            <motion.div
              aria-hidden
              className="absolute rounded-[1.25rem] border-2 border-[var(--brand-red)]"
              style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.9, 0.2, 0.9] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              key={step.target}
              role="dialog"
              aria-live="polite"
              aria-labelledby="tour-step-title"
              initial={{ opacity: 0, y: below ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="pointer-events-auto absolute rounded-[var(--radius-lg)] bg-white p-5 text-[var(--brand-navy)] shadow-[0_24px_60px_-20px_rgb(4_15_34_/_0.7)]"
              style={{ top: Math.max(16, Math.min(cardPos.top ?? rect.top - 300, viewport.h - 320)), left: cardLeft, width: CARD_W, maxHeight: Math.max(0, viewport.h - 32), overflowY: "auto" }}
            >
              {/* Flecha hacia el botón */}
              <motion.span
                aria-hidden
                className="absolute h-4 w-4 rotate-45 bg-white"
                style={{
                  left: Math.min(Math.max(rect.left + rect.width / 2 - cardLeft - 8, 20), CARD_W - 36),
                  ...(below ? { top: -8 } : { bottom: -8 }),
                }}
              />
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)]">
                  Paso {stepIndex + 1} de {activeSteps.length}
                </p>
                <button type="button" onClick={close} className="-mr-1 -mt-1 rounded-full px-2 py-1 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-subtle)]">
                  Saltar
                </button>
              </div>
              <p id="tour-step-title" className="mt-1 text-lg font-extrabold">{step.title}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{step.body}</p>

              <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
                <motion.div className="h-full rounded-full bg-[var(--brand-red)]" animate={{ width: `${((stepIndex + 1) / activeSteps.length) * 100}%` }} />
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.max(i - 1, 0))}
                  disabled={stepIndex === 0}
                  className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] px-3 text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--surface-subtle)] disabled:opacity-35"
                >
                  <ArrowLeft aria-hidden className="mr-1.5" size={16} />
                  Anterior
                </button>
                <button
                  ref={nextRef}
                  type="button"
                  onClick={() => (isLast ? close() : setStepIndex((i) => i + 1))}
                  className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-[var(--brand-navy)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-navy-strong)]"
                >
                  {isLast ? "Listo" : "Siguiente"}
                  {!isLast && <ArrowRight aria-hidden className="ml-1.5" size={16} />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
