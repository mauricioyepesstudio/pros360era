"use client";

import { useId, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import { cn } from "@/lib/cn";

type Audience = "profesional" | "cliente";

const AUDIENCE_KEY = "evolusa:audience";
const DISMISSED_KEY = "evolusa:audience-dismissed";
const SERVER_SNAPSHOT = "server";

const listeners = new Set<() => void>();
// Fallback when localStorage is blocked (private mode): the choice still works for this visit.
const memory: Record<string, string> = {};

function readStorage(key: string) {
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) return value;
  } catch {
    // fall through to memory
  }
  return memory[key] ?? null;
}

function writeStorage(key: string, value: string) {
  memory[key] = value;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // memory fallback above
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const getSnapshot = () => `${readStorage(AUDIENCE_KEY) ?? ""}|${readStorage(DISMISSED_KEY) ?? ""}`;
const getServerSnapshot = () => SERVER_SNAPSHOT;

const pill =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-blue-on-dark)]";
const pillIdle = "border-white/35 text-white hover:bg-white/10";
const pillActive = "border-white bg-white text-[var(--brand-navy)]";

type AudienceSelectorProps = {
  className?: string;
  /** Desktop hero is a fixed artboard: the panel floats instead of pushing content down. */
  floatingPanel?: boolean;
};

export default function AudienceSelector({ className, floatingPanel = false }: AudienceSelectorProps) {
  const panelId = useId();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [panelOverride, setPanelOverride] = useState<boolean | null>(null);

  if (snapshot === SERVER_SNAPSHOT) return null;

  const [storedAudience, storedDismissed] = snapshot.split("|");
  if (storedDismissed === "1") return null;

  const audience: Audience | null = storedAudience === "profesional" || storedAudience === "cliente" ? storedAudience : null;
  const panelOpen = panelOverride ?? audience === "profesional";

  function choose(next: Audience) {
    writeStorage(AUDIENCE_KEY, next);
  }

  function toggleProfessional() {
    setPanelOverride(audience === "profesional" ? !panelOpen : true);
    choose("profesional");
  }

  function dismiss() {
    writeStorage(DISMISSED_KEY, "1");
  }

  return (
    <div className={cn("relative", className)}>
      <div role="group" aria-label="Cómo quieres usar EVOLUSA" className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={audience === "profesional"}
          aria-expanded={panelOpen}
          aria-controls={panelId}
          onClick={toggleProfessional}
          className={cn(pill, audience === "profesional" ? pillActive : pillIdle)}
        >
          Soy profesional
        </button>
        <Link
          href="/profesionales"
          onClick={() => choose("cliente")}
          aria-current={audience === "cliente" ? "true" : undefined}
          className={cn(pill, audience === "cliente" ? pillActive : pillIdle)}
        >
          Busco un profesional
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar selector"
          className="inline-flex size-11 items-center justify-center rounded-[var(--radius-pill)] text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-blue-on-dark)]"
        >
          <X aria-hidden size={18} />
        </button>
      </div>

      {panelOpen && (
        <div
          id={panelId}
          className={cn(
            "rounded-[var(--radius-md)] border border-white/15 bg-[var(--brand-navy-strong)] p-4 text-white",
            floatingPanel ? "absolute left-0 top-full z-20 mt-2 w-[26rem] max-w-full shadow-[var(--shadow-md)]" : "mt-3",
          )}
        >
          <p className="text-sm font-bold">EVOLUSA para profesionales</p>
          <p className="mt-1 text-sm leading-6 text-white/75">
            Un perfil aprobado, visibilidad constante y contacto con personas que buscan tu servicio. Es crecimiento orgánico: los resultados dependen de tu constancia y del mercado de cada profesional.
          </p>
          <ButtonLink href="/aplicar-profesional" variant="primary" className="mt-3">
            Aplicar como profesional
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
