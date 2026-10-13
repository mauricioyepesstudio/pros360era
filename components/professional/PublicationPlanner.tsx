"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { mergeInstagramHistory, type InstagramHistory } from "@/lib/professional-planner/instagram-history";
import { plannerTimeZoneLabel, type PostPublication } from "@/lib/professional-planner/publishing";
import type { PlannerNetworks } from "@/lib/professional-planner/persistence";
import { savePlannerAction } from "@/app/(account)/panel-profesional/planner/actions";
import { addPlannerSuggestions, type PlannerSuggestion } from "@/lib/professional-planner/suggestions";
import PlannerImport from "@/components/professional/PlannerImport";

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
  networks,
  publications,
  suggestions,
}: {
  initial: ProfessionalPlanner;
  saved: boolean;
  proposedFromKit: boolean;
  today: string;
  imageOptions: PlannerImageOption[];
  networks: PlannerNetworks;
  publications: Record<string, PostPublication>;
  suggestions: PlannerSuggestion[];
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initial.posts);
  const [importedPublications, setImportedPublications] = useState<Record<string, PostPublication>>({});
  const [syncing, setSyncing] = useState(Boolean(networks.instagram));
  const connectedUsername = networks.instagram?.username;
  const [historyNotice, setHistoryNotice] = useState("");
  const publicationStates = { ...publications, ...importedPublications };
  const syncInstagram = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/social/instagram/media", { cache: "no-store", signal });
      const data = await response.json() as InstagramHistory & { error?: string };
      if (!response.ok) throw new Error(data.error || "No pudimos leer Instagram.");
      if (signal?.aborted) return;
      setPosts((current) => mergeInstagramHistory(current, data.posts));
      setImportedPublications(data.publications);
      setHistoryNotice(data.posts.length ? `Se muestran ${data.posts.length} publicaciones recientes de tu Instagram. Las nuevas publicaciones se programan aparte.` : "Instagram no devolvió publicaciones del feed. Aquí puedes preparar tus próximas piezas.");
    } catch (error) {
      if (!signal?.aborted) setHistoryNotice(error instanceof Error ? error.message : "No pudimos leer Instagram.");
    } finally { if (!signal?.aborted) setSyncing(false); }
  }, []);
  useEffect(() => {
    if (!connectedUsername) return;
    const controller = new AbortController();
    void fetch("/api/social/instagram/media", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as InstagramHistory & { error?: string };
        if (!response.ok) throw new Error(data.error || "No pudimos leer Instagram.");
        return data;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setPosts((current) => mergeInstagramHistory(current, data.posts));
        setImportedPublications(data.publications);
        setHistoryNotice(data.posts.length ? `Se muestran ${data.posts.length} publicaciones recientes de tu Instagram.` : "Instagram no devolvió publicaciones del feed. Aquí puedes preparar tus próximas piezas.");
        setSyncing(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setHistoryNotice(error instanceof Error ? error.message : "No pudimos leer Instagram.");
        setSyncing(false);
      });
    return () => controller.abort();
  }, [connectedUsername]);
  const [isSaved, setIsSaved] = useState(saved);
  const firstDated = initial.posts.find((post) => post.date && post.date >= today)?.date;
  const [month, setMonth] = useState(monthKey(firstDated ?? today));
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [editing, setEditing] = useState<PlannerPost | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; failed: boolean } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publicImageConsent, setPublicImageConsent] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [suggestionDate, setSuggestionDate] = useState(today);

  const byDate = useMemo(() => {
    const map = new Map<string, PlannerPost[]>();
    for (const post of posts) if (post.date) map.set(post.date, [...(map.get(post.date) ?? []), post]);
    return map;
  }, [posts]);
  const undated = posts.filter((post) => !post.date);
  const monthPosts = posts.filter((post) => post.date && monthKey(post.date) === month);
  // What Instagram did wins over the saved status: a post that went out shows as published.
  const shownStatus = (post: PlannerPost): PlannerStatus => (publicationStates[post.id]?.state === "PUBLISHED" ? "PUBLISHED" : post.status);
  const counts = (Object.keys(plannerStatuses) as PlannerStatus[]).map((status) => ({ status, count: posts.filter((post) => shownStatus(post) === status).length }));
  const networkLabel = (post: PlannerPost) => plannerPlatforms[post.platform];
  const autoAccount = (post: PlannerPost) => (post.platform === "instagram" || post.platform === "facebook" ? networks[post.platform] : undefined);
  const publicationLine = (post: PlannerPost) => {
    const publication = publicationStates[post.id];
    if (!publication) return null;
    if (publication.state === "PUBLISHED") return publication.permalink ? <a href={publication.permalink} target="_blank" rel="noreferrer" className="font-semibold text-green-700 underline">Publicada en {networkLabel(post)}</a> : <span className="font-semibold text-green-700">Publicada en {networkLabel(post)}</span>;
    if (publication.state === "PUBLISHING") return <span className="font-semibold text-[var(--brand-blue-strong)]">Publicando en {networkLabel(post)}…</span>;
    return <span className="font-semibold text-[var(--danger)]">{publication.error}</span>;
  };

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

  async function uploadImage(file: File) {
    if (!editing) return;
    const postId = editing.id;
    if (!publicImageConsent || file.size >= 4 * 1024 * 1024) {
      setNotice({ text: "Confirma el uso público y elige una imagen de menos de 4 MB.", failed: true });
      return;
    }
    setUploading(true);
    setNotice(null);
    try {
      const form = new FormData();
      form.set("image", file);
      form.set("publicImageConsent", "true");
      const response = await fetch("/api/professional/planner/image", { method: "POST", body: form });
      const result = await response.json() as { imageUrl?: string; error?: string };
      if (!response.ok || !result.imageUrl) throw new Error(result.error || "No pudimos subir la imagen.");
      setEditing((current) => current?.id === postId ? { ...current, imageUrl: result.imageUrl!, status: "IDEA" } : current);
      setNotice({ text: "Imagen subida. La publicación queda como Idea; guarda los cambios y revísala antes de marcarla lista.", failed: false });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "No pudimos subirla. La imagen anterior sigue intacta.", failed: true });
    } finally { setUploading(false); }
  }

  async function saveSuggestions() {
    const next = addPlannerSuggestions(posts, suggestions, selectedSuggestions, suggestionDate);
    if (!next) { setNotice({ text: `Revisa la fecha y el límite de ${plannerMaxPosts} publicaciones.`, failed: true }); return; }
    if (await persist(next, "Ideas añadidas al calendario. Revisa cada borrador antes de publicarlo.")) {
      setPosts(next);
      setMonth(monthKey(suggestionDate));
      setSelectedSuggestions([]);
      setShowSuggestions(false);
    }
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
        <span className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusStyles[shownStatus(post)]}`}>{plannerStatuses[shownStatus(post)]}</span>
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
          {publicationStates[post.id] ? <span className="mt-1 block text-sm">{publicationLine(post)}</span> : null}
        </span>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[shownStatus(post)]}`}>{plannerStatuses[shownStatus(post)]}</span>
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
        <strong className="text-[var(--brand-navy)]">Publicación automática en Instagram y Facebook.</strong> Lo que marques «Listo para publicar» en esas redes sale solo a su fecha y hora ({plannerTimeZoneLabel}); el formato 9:16 sale como Story. Las demás redes las publicas tú desde su app.
        <span className="mt-2 block">
          Instagram: {networks.instagram?.canPublish ? <strong className="text-[var(--success)]">activa (@{networks.instagram.username})</strong> : <strong className="text-[var(--warning)]">{networks.instagram ? "vuelve a conectarla" : "sin conectar"}</strong>}
          {" · "}
          Facebook: {networks.facebook?.canPublish ? <strong className="text-[var(--success)]">activa ({networks.facebook.username})</strong> : <strong className="text-[var(--warning)]">{networks.facebook ? "vuelve a conectarla" : "sin conectar"}</strong>}
          {networks.instagram?.canPublish && networks.facebook?.canPublish ? null : <> · Conéctalas en <Link href="/panel-profesional/redes" className="font-semibold text-[var(--brand-blue)] underline">Redes</Link>.</>}
        </span>
      </section>

      {networks.instagram && <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-[var(--brand-navy)]">Tu historial de Instagram</h2><button type="button" disabled={syncing} onClick={() => { setSyncing(true); void syncInstagram(); }} className="min-h-11 rounded-full border border-[var(--border)] px-4 font-semibold disabled:opacity-60">{syncing ? "Leyendo Instagram…" : "Actualizar publicaciones"}</button></div>
        <p className="mt-2 text-sm text-[var(--muted)]" role="status">{historyNotice || "Consultando las publicaciones de tu cuenta conectada…"}</p>
        {posts.some((post) => post.id.startsWith("ig-")) && <ol className="mt-4 space-y-3">{posts.filter((post) => post.id.startsWith("ig-")).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).slice(0, 5).map(listRow)}</ol>}
      </section>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {counts.map(({ status, count }) => (
            <span key={status} className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status]}`}>
              {plannerStatuses[status]}: {count}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-expanded={showSuggestions} onClick={() => setShowSuggestions(!showSuggestions)} className="min-h-11 rounded-full border border-[var(--border)] px-4 font-semibold">Sugerencias actuales</button>
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

      {showSuggestions && <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-bold text-[var(--brand-navy)]">Ideas para tu próxima publicación</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Propuestas de tu kit y plantillas editables. Selecciona las que te gusten: se guardan como Ideas, sin publicarse.</p>
        <ul className="mt-4 space-y-3">{suggestions.filter((item) => !posts.some((post) => post.id === item.id)).map((item) => <li key={item.id}><label className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] p-3"><input type="checkbox" checked={selectedSuggestions.includes(item.id)} onChange={(event) => setSelectedSuggestions(event.target.checked ? [...selectedSuggestions, item.id] : selectedSuggestions.filter((id) => id !== item.id))} className="mt-1 size-5" /><span><strong className="block">{item.title}</strong><span className="block text-xs text-[var(--muted)]">{item.source}</span>{item.caption && <span className="mt-1 block text-sm">{item.caption}</span>}</span></label></li>)}</ul>
        <label className="mt-4 block text-sm font-semibold">Fecha para las ideas seleccionadas<input type="date" required value={suggestionDate} onChange={(event) => setSuggestionDate(event.target.value)} className={field} /></label>
        <button type="button" disabled={busy || !selectedSuggestions.length} onClick={() => void saveSuggestions()} className="mt-4 min-h-11 rounded-full bg-[var(--brand-blue)] px-5 font-bold text-white disabled:opacity-60">{busy ? "Guardando…" : "Añadir al calendario"}</button>
      </section>}

      <PlannerImport posts={posts} busy={busy} save={async (next) => {
        if (!await persist(next, "Plantilla importada como Ideas.")) return false;
        setPosts(next);
        const date = next.find((post) => !posts.some((current) => current.id === post.id))?.date;
        if (date) setMonth(monthKey(date));
        return true;
      }} />

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

            <fieldset disabled={busy || uploading} className="mt-4 space-y-4 disabled:opacity-60">
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
                  <select disabled={editing.id.startsWith("ig-")} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as PlannerStatus })} className={field}>
                    {Object.entries(plannerStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>

              <div>
                <p className="text-sm font-semibold">Imagen</p>
                {!editing.id.startsWith("ig-") && <div className="mt-2 rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-3">
                  <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={publicImageConsent} onChange={(event) => setPublicImageConsent(event.target.checked)} className="mt-0.5 size-4 shrink-0" />Esta imagen será accesible públicamente para compartirla en redes. Tengo permiso para usarla. No subiré documentos privados.</label>
                  <label className="mt-3 block text-sm font-semibold">{uploading ? "Subiendo imagen…" : "Subir imagen desde tu dispositivo"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={!publicImageConsent || uploading} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void uploadImage(file); }} className="mt-2 block w-full text-xs file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-[var(--brand-blue)] file:px-4 file:font-semibold file:text-white disabled:opacity-60" /></label>
                  <p className="mt-2 text-xs text-[var(--muted)]">JPG, PNG o WebP de menos de 4 MB. Se convierte a JPG y se eliminan metadatos. Hasta 200 imágenes por cuenta.</p>
                </div>}
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

            {publications[editing.id] ? <p className="mt-4 rounded-[var(--radius-md)] bg-[var(--warm-canvas)] p-3 text-sm">{publicationLine(editing)}</p> : null}
            {editing.status === "READY" && autoAccount(editing) !== undefined && editing.date && !publications[editing.id] ? (
              <p className="mt-4 text-sm text-[var(--muted)]">
                {autoAccount(editing)?.canPublish
                  ? `Saldrá sola en ${networkLabel(editing)} el ${dayLabel(editing.date)} a las ${editing.time ?? "12:00"} (${plannerTimeZoneLabel})${editing.format === "9x16" ? " como Story" : ""}.`
                  : `Para que salga sola, conecta tu ${networkLabel(editing)} en Redes.`}
              </p>
            ) : null}
            {notice ? (
              <p role={notice.failed ? "alert" : "status"} className="mt-4 rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-3 text-sm">{notice.text}</p>
            ) : null}

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
              {posts.some((post) => post.id === editing.id) ? (
                <button type="button" disabled={busy} onClick={() => void removeEditing()} className="inline-flex min-h-11 items-center gap-1 rounded-full px-4 font-semibold text-[var(--danger)] disabled:opacity-60">
                  <Trash2 aria-hidden size={16} /> Eliminar
                </button>
              ) : <span />}
              <button type="submit" disabled={busy || uploading} className="min-h-11 rounded-full bg-[var(--brand-blue)] px-6 font-bold text-white disabled:opacity-60">
                {busy ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
