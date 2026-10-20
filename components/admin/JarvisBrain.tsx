"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import {
  BRAIN_STATUS_LABEL,
  type BrainModule,
  type BrainModuleStatus,
  type DailyTask,
} from "@/lib/admin/jarvis";
import styles from "./jarvis.module.css";

const TILE = 64;
const CORE_CENTER = TILE * 3.5;

const STATUS_COLOR: Record<BrainModuleStatus, string> = {
  live: "var(--live)",
  ready: "var(--ready)",
  building: "var(--building)",
  pending: "var(--pending)",
  blocked: "var(--blocked)",
};

const STATUS_HEIGHT: Record<BrainModuleStatus, number> = {
  live: 76,
  ready: 54,
  building: 40,
  pending: 18,
  blocked: 30,
};

type Readiness = { live: number; total: number; ready: boolean; missing: readonly BrainModule[] };

type Props = {
  modules: readonly BrainModule[];
  tasks: readonly DailyTask[];
  dayKey: string;
  readiness: Readiness;
};

const vars = (values: Record<string, string | number>) => values as CSSProperties;

export default function JarvisBrain({ modules, tasks, dayKey, readiness }: Props) {
  const [selectedId, setSelectedId] = useState(modules.find((m) => m.status === "blocked")?.id ?? modules[0]?.id);
  const selected = modules.find((m) => m.id === selectedId) ?? modules[0];
  const done = useDailyChecks(dayKey);
  const blocked = modules.filter((m) => m.status === "blocked");
  const pendingTasks = tasks.filter((task) => !done.ids.includes(task.id)).length;

  const greeting = blocked.length
    ? `Hoy hay ${blocked.length === 1 ? "un bloqueo" : `${blocked.length} bloqueos`}: ${blocked.map((m) => m.name.toLowerCase()).join(", ")}. Te quedan ${pendingTasks} de ${tasks.length} tareas.`
    : `Sin bloqueos. Te quedan ${pendingTasks} de ${tasks.length} tareas.`;

  return (
    <section className={cn(styles.shell, "p-4 sm:p-6")} aria-labelledby="jarvis-title">
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={cn(styles.muted, "text-[11px] font-bold uppercase tracking-[0.3em]")}>3D Pixel Jarvis · {dayKey}</p>
          <h2 id="jarvis-title" className={cn(styles.pixelTitle, "mt-1 text-xl sm:text-2xl")}>Cerebro EVOLUSA</h2>
        </div>
        <p className={cn(styles.pixelBox, "max-w-md px-3 py-2 text-xs leading-5 sm:text-sm")} aria-live="polite">
          <span className="font-bold text-[var(--glow)]">JARVIS&gt; </span>
          <span className={styles.typing}>{greeting}</span>
        </p>
      </div>

      <div className="relative z-10 mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className={cn(styles.viewport, "min-w-0")}>
          <div className={styles.scaler}>
            <div className={styles.stage}>
              <div className={styles.floor} aria-hidden />
              {modules.map((module) => (
                <Link3D key={`link-${module.id}`} module={module} />
              ))}
              <div className={styles.core} aria-hidden>
                <div className={styles.cube}>
                  <Faces />
                </div>
                <div className={styles.ring} />
                <div className={styles.billboard} style={vars({ "--z": "190px" })}>
                  <div className={styles.hologram}>
                    <JarvisFace />
                    <span className={styles.hologramLabel}>JARVIS</span>
                  </div>
                </div>
              </div>
              {modules.map((module, index) => (
                <ModuleBlock
                  key={module.id}
                  index={index + 1}
                  module={module}
                  selected={module.id === selected?.id}
                  onSelect={() => setSelectedId(module.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          {selected ? <ModuleDetail module={selected} index={modules.indexOf(selected) + 1} /> : null}
          <div className={cn(styles.pixelBox, "py-2")}>
            <p className={cn(styles.muted, "px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.2em]")}>Módulos</p>
            <ul>
              {modules.map((module, index) => (
                <li key={module.id}>
                  <button
                    type="button"
                    className={styles.listButton}
                    aria-pressed={module.id === selected?.id}
                    onClick={() => setSelectedId(module.id)}
                  >
                    <span className={styles.statusDot} style={vars({ "--c": STATUS_COLOR[module.status] })} aria-hidden />
                    <span className="w-5 font-bold">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate">{module.name}</span>
                    <span className={cn(styles.muted, "text-[11px]")}>{BRAIN_STATUS_LABEL[module.status]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-6 grid gap-6 lg:grid-cols-2">
        <LaunchGate readiness={readiness} modules={modules} />
        <DailyTasks tasks={tasks} done={done} />
      </div>

      <p className={cn(styles.muted, "relative z-10 mt-6 text-[11px] leading-5")}>
        Estados curados a partir de los PR integrados y de ESTADO.md, no medidos en vivo. Se actualizan en el mismo PR que cambia cada módulo.
      </p>
    </section>
  );
}

function Faces() {
  return (
    <>
      <div className={cn(styles.face, styles.north)} />
      <div className={cn(styles.face, styles.west)} />
      <div className={cn(styles.face, styles.south)} />
      <div className={cn(styles.face, styles.east)} />
      <div className={cn(styles.face, styles.top)} />
    </>
  );
}

function ModuleBlock({ module, index, selected, onSelect }: { module: BrainModule; index: number; selected: boolean; onSelect: () => void }) {
  const height = STATUS_HEIGHT[module.status];
  return (
    <button
      type="button"
      className={cn(styles.moduleButton, module.status === "building" && styles.building, module.status === "blocked" && styles.blocked)}
      style={vars({
        left: module.grid.x * TILE,
        top: module.grid.y * TILE,
        "--s": "40px",
        "--h": `${height}px`,
        "--c": STATUS_COLOR[module.status],
      })}
      aria-pressed={selected}
      aria-label={`${module.name}: ${BRAIN_STATUS_LABEL[module.status]}`}
      onClick={onSelect}
      tabIndex={-1}
    >
      <div className={styles.cube}>
        <Faces />
      </div>
      <span className={styles.billboard} style={vars({ "--z": `${height + (selected ? 34 : 18)}px` })}>
        <span className={styles.badge}>
          {index}
          {selected ? <span className={styles.badgeName}>{module.name}</span> : null}
        </span>
      </span>
    </button>
  );
}

function Link3D({ module }: { module: BrainModule }) {
  const x = (module.grid.x + 0.5) * TILE;
  const y = (module.grid.y + 0.5) * TILE;
  const dx = x - CORE_CENTER;
  const dy = y - CORE_CENTER;
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const flowing = module.status === "live" || module.status === "ready";
  return (
    <div
      className={styles.link}
      aria-hidden
      style={vars({
        left: CORE_CENTER,
        top: CORE_CENTER - 2,
        width: length,
        transform: `rotate(${angle}deg)`,
        "--link-color": STATUS_COLOR[module.status],
      })}
    >
      {flowing ? <span className={styles.pulse} style={{ animationDelay: `${(module.grid.x + module.grid.y) * -0.35}s` }} /> : null}
    </div>
  );
}

function ModuleDetail({ module, index }: { module: BrainModule; index: number }) {
  return (
    <article className={cn(styles.pixelBox, "p-4")} aria-live="polite">
      <div className="flex items-center gap-2">
        <span className={styles.statusDot} style={vars({ "--c": STATUS_COLOR[module.status] })} aria-hidden />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: STATUS_COLOR[module.status] }}>
          {BRAIN_STATUS_LABEL[module.status]} · {module.area}
        </p>
      </div>
      <h3 className={cn(styles.pixelTitle, "mt-2 text-base")}>
        {index}. {module.name}
      </h3>
      <p className="mt-2 text-sm leading-6">{module.summary}</p>
      <p className="mt-3 text-sm leading-6">
        <span className="font-bold text-[var(--glow)]">Siguiente: </span>
        {module.next}
      </p>
      <p className={cn(styles.muted, "mt-3 text-[11px]")}>Evidencia: {module.evidence}</p>
    </article>
  );
}

function LaunchGate({ readiness, modules }: { readiness: Readiness; modules: readonly BrainModule[] }) {
  const gate = modules.filter((m) => m.launchGate);
  return (
    <div className={cn(styles.pixelBox, "p-4")}>
      <p className={cn(styles.muted, "text-[11px] font-bold uppercase tracking-[0.2em]")}>Portón de lanzamiento</p>
      <h3 className={cn(styles.pixelTitle, "mt-1 text-base")}>
        {readiness.live}/{readiness.total} módulos en producción
      </h3>
      <p className="mt-2 text-sm leading-6">
        {readiness.ready
          ? "El flujo CRM, redes, posteo y leads funciona de punta a punta: ya se puede invitar a profesionales."
          : "No se invita a profesionales nuevos hasta que CRM, redes, posteo y leads funcionen de punta a punta."}
      </p>
      <div className={cn(styles.gateTrack, "mt-4")} role="img" aria-label={`${readiness.live} de ${readiness.total} módulos del portón en producción`}>
        {gate.map((m) => (
          <span key={m.id} className={styles.gateCell} style={vars({ "--c": STATUS_COLOR[m.status] })} title={`${m.name}: ${BRAIN_STATUS_LABEL[m.status]}`} />
        ))}
      </div>
      {readiness.missing.length ? (
        <ul className="mt-4 space-y-1 text-sm">
          {readiness.missing.map((m) => (
            <li key={m.id} className="flex items-center gap-2">
              <span className={styles.statusDot} style={vars({ "--c": STATUS_COLOR[m.status] })} aria-hidden />
              <span>{m.name}</span>
              <span className={cn(styles.muted, "text-[11px]")}>· {BRAIN_STATUS_LABEL[m.status]}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type DailyChecks = { ids: string[]; toggle: (id: string) => void };

function DailyTasks({ tasks, done }: { tasks: readonly DailyTask[]; done: DailyChecks }) {
  return (
    <div className={cn(styles.pixelBox, "p-4")}>
      <p className={cn(styles.muted, "text-[11px] font-bold uppercase tracking-[0.2em]")}>Misiones de hoy</p>
      <h3 className={cn(styles.pixelTitle, "mt-1 text-base")}>Autodesarrollo del cerebro</h3>
      <ul className="mt-4 space-y-3">
        {tasks.map((task) => {
          const checked = done.ids.includes(task.id);
          return (
            <li key={task.id} className="flex gap-3">
              <button
                type="button"
                className={styles.taskToggle}
                role="checkbox"
                aria-checked={checked}
                aria-label={task.title}
                onClick={() => done.toggle(task.id)}
              >
                {checked ? "✓" : ""}
              </button>
              <div className={cn("min-w-0 text-sm leading-6", checked && styles.done)}>
                <p className="font-semibold">
                  {task.title}
                  {task.pinnedWhileBlocked ? <span className="ml-2 text-[11px] font-bold text-[var(--blocked)]">BLOQUEO</span> : null}
                </p>
                <p className={cn(styles.muted, "text-xs leading-5")}>
                  {task.owner === "Jarvis" ? "Lo puede hacer Claude en un hilo" : "Lo haces tú"} · {task.area} · {task.why}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Marcas por día, solo en este navegador (comodidad personal, no registro). */
function useDailyChecks(dayKey: string): DailyChecks {
  const storageKey = `evolusa-jarvis-${dayKey}`;
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate once from browser storage
      setIds(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : []);
    } catch {
      setIds([]);
    }
  }, [storageKey]);
  const toggle = (id: string) => {
    setIds((current) => {
      const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* almacenamiento no disponible: la marca vive solo en esta visita */
      }
      return next;
    });
  };
  return { ids, toggle };
}

/** Cara pixel art de Jarvis, 12×12. */
function JarvisFace() {
  const visor = [
    "..########..",
    ".##########.",
    "###......###",
    "##........##",
    "##........##",
    "##........##",
    "###......###",
    ".###....###.",
    "..########..",
    "...##..##...",
    "..###..###..",
    ".####..####.",
  ];
  return (
    <svg className={styles.face8} viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden>
      {visor.flatMap((row, y) =>
        row.split("").map((cell, x) => (cell === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="var(--glow)" /> : null)),
      )}
      <rect x={2} y={3} width={8} height={4} fill="var(--brand-blue)" opacity={0.55} />
      <rect className={styles.eye} x={3} y={4} width={2} height={2} fill="#fff" />
      <rect className={styles.eye} x={7} y={4} width={2} height={2} fill="#fff" />
      <rect x={5} y={7} width={2} height={1} fill="#fff" />
    </svg>
  );
}
