"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, Copy, Download, List, Plus, Trash2, X } from "lucide-react";
import {
  plannerCaptionLimit,
  plannerFormats,
  plannerMaxPosts,
  plannerPlatforms,
  plannerStatuses,
  sortPosts,
  type PlannerPost,
  type PlannerStatus,
  type ProfessionalPlanner,
} from "@/lib/professional-planner/validation";
import { savePlannerAction } from "@/app/(account)/panel-profesional/planner/actions";

export type PlannerImageOption = { src: string; label: string };

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const statusStyles: Record<PlannerStatus, string> = {
  IDEA: "bg-slate-100 text-slate-700",
  DRAFT: "bg-amber-50 text-amber-800",
  READY: "bg-[var(--sky-surface)] text-[var(--brand-blue-strong)]",
  PUBLISHED: "bg-green-50 text-green-700",
};

function monthKey(date: string) {
  return date.slice(0, 7);
}

function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const label = new Intl.DateTimeFormat("es", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function dayLabel(date: string) {
  return new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

/** Monday-first grid of ISO dates (null = padding) for the month. */
function monthGrid(key: string): (string | null)[] {
  const [y, m] = key.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const pad = (first.getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array.from({ length: pad }, () => null);
  for (let d = 1; d <= days; d += 1) cells.push(`${key}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

function newId() {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function blankPost(date: string | null): PlannerPost {
  return { id: newId(), date, time: date ? "12:00" : null, platform: "instagram", format: "4x5", title: "", caption: "", imageUrl: null, status: "IDEA", note: null };
}

export default function PublicationPlanner({
  initial,
  saved,
  proposedFromKit,
  today,
  imageOptions,
}: {
  initial: ProfessionalPlanner;
  saved: boolean;
  proposedFromKit: boolean;
  today: string;
  imageOptions: PlannerImageOption[];
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initial.posts);
  const [isSaved, setIsSaved] = useState(saved);
  const firstDated = initial.posts.find((post) => post.date && post.date >= today)?.date;
  const [month, setMonth] = useState(monthKey(firstDated ?? today));
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [editing, setEditing] = useState<PlannerPost | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; failed: boolean } | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, PlannerPost[]>();
    for (const post of posts) if (post.date) map.set(post.date, [...(map.get(post.date) ?? []), post]);
    return map;
  }, [posts]);
  const undated = posts.filter((post) => !post.date);
  const monthPosts = posts.filter((post) => post.date && monthKey(post.date) === month);
  const counts = (Object.keys(plannerStatuses) as PlannerStatus[]).map((status) => ({ status, count: posts.filter((post) => post.status === status).length }));

  async function persist(next: PlannerPost[], message?: string) {
    setBusy(true);
    setNotice(null);
    try {
      const result = await savePlannerAction({ posts: next });
      setNotice({ text: message && result.saved ? message : result.message, failed: !result.saved });
      if (result.saved) {
        setIsSaved(true);
        router.refresh();
      }
      return result.saved;
    } catch {
      setNotice({ text: "No pudimos conectar. Tus cambios siguen en pantalla.", failed: true });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveEditing() {
    if (!editing) return;
    if (!editing.title.trim()) {
      setNotice({ text: "Ponle un título a la publicación.", failed: true });
      return;
    }
    if (editing.status === "PUBLISHED" && !editing.date) {
      setNotice({ text: "Una publicación marcada como publicada necesita fecha.", failed: true });
      return;
    }
    const clean = { ...editing, title: editing.title.trim(), time: editing.date ? editing.time : null, note: editing.note?.trim() ? editing.note : null };
    const next = sortPosts([...posts.filter((post) => post.id !== clean.id), clean]);
    setPosts(next);
    if (await persist(next, "Publicación guardada.")) setEditing(null);
  }

  async function removeEditing() {
    if (!editing) return;
    const next = posts.filter((post) => post.id !== editing.id);
    setPosts(next);
    if (await persist(next, "Publicación eliminada.")) setEditing(null);
  }

  function openNew(date: string | null) {
    if (posts.length >= plannerMaxPosts) {
      setNotice({ text: `Tu planner admite hasta ${plannerMaxPosts} publicaciones.`, failed: true });
      return;
    }
    setEditing(blankPost(date));
  }

  const chip = (post: PlannerPost) => (
    <button
      key={post.id}
      type="button"
      onClick={() => setEditing(post)}
      className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white p-1.5 text-left text-xs transition hover:border-[var(--brand-blue)]"
    >
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" className="size-7 shrink-0 rounded object-cover" />
      ) : (
        <span className="size-7 shrink-0 rounded bg-[var(--sky-surface)]" aria-hidden />
      )}
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-[11px] font-semibold leading-tight text-[var(--brand-navy)]">{post.title}</span>
        <span className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusStyles[post.status]}`}>{plannerStatuses[post.status]}</span>
      </span>
    </button>
  );

  const listRow = (post: PlannerPost) => (
    <li key={post.id}>
      <button type="button" onClick={() => setEditing(post)} className="flex w-full items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-3 text-left transition hover:border-[var(--brand-blue)]">
        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageUrl} alt="" className="size-16 shrink-0 rounded-[var(--radius-sm)] object-cover" />
        ) : (
          <span className="size-16 shrink-0 rounded-[var(--radius-sm)] bg-[var(--sky-surface)]" aria-hidden />
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {post.date ? `${dayLabel(post.date)}${post.time ? ` · ${post.time}` : ""}` : "Sin fecha"} · {plannerPlatforms[post.platform]}
          </span>
          <span className="mt-1 block font-bold text-[var(--brand-navy)]">{post.title}</span>
          {post.note ? <span className="mt-1 block text-sm text-[var(--muted)]">{post.note}</span> : null}
        </span>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[post.status]}`}>{plannerStatuses[post.status]}</span>
      </button>
    </li>
  );

  const field = "mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm";

  return (
    <div className="space-y-6">
      {!isSaved && proposedFromKit ? (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] bg-[var(--brand-navy)] p-5 text-white">
          <p className="max-w-2xl leading-7">
            Te dejamos una propuesta con tus creativos, dos publicaciones por semana. Mueve las fechas, escribe los textos y guárdala cuando te guste.
          </p>
          <button type="button" disabled={busy} onClick={() => void persist(posts, "Propuesta guardada en tu planner.")} className="min-h-11 rounded-full bg-white px-5 font-bold text-[var(--brand-navy)] disabled:opacity-60">
            Guardar propuesta
          </button>
        </section>
      ) : null}

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
        <strong className="text-[var(--brand-navy)]">Publicación automática: aún no disponible.</strong> Planifica aquí y publica desde tu app. Ya puedes preparar tu cuenta en <Link href="/panel-profesional/redes" className="font-semibold text-[var(--brand-blue)] underline">Redes</Link>; cuando la publicación se active, tus publicaciones listas saldrán desde este mismo planner.
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {counts.map(({ status, count }) => (
            <span key={status} className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status]}`}>
              {plannerStatuses[status]}: {count}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-full border border-[var(--border)] bg-white p-1 md:flex">
            <button type="button" onClick={() => setView("calendar")} aria-pressed={view === "calendar"} className={`inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold ${view === "calendar" ? "bg-[var(--brand-navy)] text-white" : ""}`}>
              <CalendarDays aria-hidden size={16} /> Calendario
            </button>
            <button type="button" onClick={() => setView("list")} aria-pressed={view === "list"} className={`inline-flex min-h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold ${view === "list" ? "bg-[var(--brand-navy)] text-white" : ""}`}>
              <List aria-hidden size={16} /> Lista
            </button>
          </div>
          <button type="button" onClick={() => openNew(null)} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-[var(--brand-blue)] px-4 font-bold text-white">
            <Plus aria-hidden size={18} /> Nueva publicación
          </button>
        </div>
      </div>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Mes anterior" className="rounded-full p-2 hover:bg-[var(--sky-surface)]">
            <ChevronLeft aria-hidden size={20} />
          </button>
          <h2 className="text-lg font-bold text-[var(--brand-navy)]">{monthLabel(month)}</h2>
          <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Mes siguiente" className="rounded-full p-2 hover:bg-[var(--sky-surface)]">
            <ChevronRight aria-hidden size={20} />
          </button>
        </div>

        <div className={view === "calendar" ? "mt-4 hidden md:block" : "hidden"}>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {monthGrid(month).map((date, index) =>
              date ? (
                <div key={date} className={`group min-h-28 rounded-[var(--radius-sm)] border p-1.5 ${date === today ? "border-[var(--brand-blue)] bg-[var(--sky-surface)]" : "border-[var(--border)] bg-[var(--warm-canvas)]"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--brand-navy)]">{Number(date.slice(8))}</span>
                    <button type="button" onClick={() => openNew(date)} aria-label={`Añadir publicación el ${dayLabel(date)}`} className="rounded-full p-0.5 text-[var(--muted)] opacity-0 transition group-hover:opacity-100 focus:opacity-100">
                      <Plus aria-hidden size={14} />
                    </button>
                  </div>
                  <div className="mt-1 space-y-1">{(byDate.get(date) ?? []).map(chip)}</div>
                </div>
              ) : (
                <div key={`pad-${index}`} aria-hidden />
              ),
            )}
          </div>
        </div>

        <ol className={view === "list" ? "mt-4 space-y-3" : "mt-4 space-y-3 md:hidden"}>
          {monthPosts.length === 0 ? <li className="text-sm text-[var(--muted)]">No hay publicaciones este mes.</li> : monthPosts.map(listRow)}
        </ol>
      </section>

      {undated.length > 0 ? (
        <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4 sm:p-5">
          <h2 className="text-lg font-bold text-[var(--brand-navy)]">Sin fecha</h2>
          <ol className="mt-3 space-y-3">{undated.map(listRow)}</ol>
        </section>
      ) : null}

      {notice && !editing ? (
        <p role={notice.failed ? "alert" : "status"} className="rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-4 text-sm">
          {notice.text}
        </p>
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="dialog" aria-modal="true" aria-labelledby="planner-editor-title">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void saveEditing();
            }}
            className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-center justify-between">
              <h2 id="planner-editor-title" className="text-xl font-bold text-[var(--brand-navy)]">
                {posts.some((post) => post.id === editing.id) ? "Editar publicación" : "Nueva publicación"}
              </h2>
              <button type="button" onClick={() => { setEditing(null); setNotice(null); }} aria-label="Cerrar" className="rounded-full p-2 hover:bg-[var(--sky-surface)]">
                <X aria-hidden size={20} />
              </button>
            </div>

            <fieldset disabled={busy} className="mt-4 space-y-4 disabled:opacity-60">
              <label className="block text-sm font-semibold">
                Título
                <input required maxLength={140} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={field} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold">
                  Fecha
                  <input type="date" value={editing.date ?? ""} onChange={(e) => setEditing({ ...editing, date: e.target.value || null, time: e.target.value ? editing.time ?? "12:00" : null })} className={field} />
                </label>
                <label className="block text-sm font-semibold">
                  Hora
                  <input type="time" disabled={!editing.date} value={editing.time ?? ""} onChange={(e) => setEditing({ ...editing, time: e.target.value || null })} className={field} />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="block text-sm font-semibold">
                  Red
                  <select value={editing.platform} onChange={(e) => setEditing({ ...editing, platform: e.target.value as PlannerPost["platform"] })} className={field}>
                    {Object.entries(plannerPlatforms).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Formato
                  <select value={editing.format} onChange={(e) => setEditing({ ...editing, format: e.target.value as PlannerPost["format"] })} className={field}>
                    {Object.entries(plannerFormats).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Estado
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as PlannerStatus })} className={field}>
                    {Object.entries(plannerStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>

              <div>
                <p className="text-sm font-semibold">Imagen</p>
                {editing.imageUrl ? (
                  <div className="mt-2 flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editing.imageUrl} alt="" className="w-32 rounded-[var(--radius-sm)] border border-[var(--border)]" />
                    <div className="flex flex-col gap-2 text-sm">
                      <a href={editing.imageUrl} download className="inline-flex items-center gap-1 font-semibold text-[var(--brand-blue)] hover:underline">
                        <Download aria-hidden size={14} /> Descargar
                      </a>
                      <button type="button" onClick={() => setEditing({ ...editing, imageUrl: null })} className="text-left text-[var(--muted)] underline">Quitar imagen</button>
                    </div>
                  </div>
                ) : null}
                {imageOptions.length > 0 ? (
                  <div className="mt-2 grid grid-cols-6 gap-1.5">
                    {imageOptions.map((option) => (
                      <button key={option.src} type="button" title={option.label} onClick={() => setEditing({ ...editing, imageUrl: option.src })} className={`overflow-hidden rounded border-2 ${editing.imageUrl === option.src ? "border-[var(--brand-blue)]" : "border-transparent"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={option.src} alt={option.label} loading="lazy" className="aspect-square w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
                <label className="mt-2 block text-xs text-[var(--muted)]">
                  O pega el enlace https de tu imagen
                  <input type="url" maxLength={500} placeholder="https://…" value={editing.imageUrl?.startsWith("https://") ? editing.imageUrl : ""} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value || null })} className={field} />
                </label>
              </div>

              <label className="block text-sm font-semibold">
                Texto de la publicación
                <textarea rows={6} maxLength={plannerCaptionLimit} value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} className={`${field} py-2`} />
                <span className="mt-1 flex items-center justify-between text-xs font-normal text-[var(--muted)]">
                  <span>{editing.caption.length}/{plannerCaptionLimit}</span>
                  {editing.caption ? (
                    <button type="button" onClick={() => void navigator.clipboard?.writeText(editing.caption)} className="inline-flex items-center gap-1 font-semibold text-[var(--brand-blue)]">
                      <Copy aria-hidden size={12} /> Copiar texto
                    </button>
                  ) : null}
                </span>
              </label>
              <label className="block text-sm font-semibold">
                Nota interna
                <input maxLength={500} value={editing.note ?? ""} onChange={(e) => setEditing({ ...editing, note: e.target.value || null })} className={field} />
              </label>
            </fieldset>

            {notice ? (
              <p role={notice.failed ? "alert" : "status"} className="mt-4 rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-3 text-sm">{notice.text}</p>
            ) : null}

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
              {posts.some((post) => post.id === editing.id) ? (
                <button type="button" disabled={busy} onClick={() => void removeEditing()} className="inline-flex min-h-11 items-center gap-1 rounded-full px-4 font-semibold text-[var(--danger)] disabled:opacity-60">
                  <Trash2 aria-hidden size={16} /> Eliminar
                </button>
              ) : <span />}
              <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-[var(--brand-blue)] px-6 font-bold text-white disabled:opacity-60">
                {busy ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
