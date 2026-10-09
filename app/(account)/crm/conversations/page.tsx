import Link from "next/link";
import { AtSign, MessageCircle, MessageSquareText } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";
import ButtonLink from "@/components/ui/ButtonLink";
import { getMyInstagramInbox } from "@/lib/social/connections";

const notices: Record<string, { tone: "ok" | "error"; text: string }> = {
  "aviso=espera": { tone: "ok", text: "Acabamos de revisar tu Instagram. Espera un par de minutos para volver a intentarlo." },
  "error=sin_conexion": { tone: "error", text: "No tienes una cuenta de Instagram conectada." },
  "error=no_configurado": { tone: "error", text: "La conexión con Instagram todavía no está activa en EVOLUSA." },
  "error=instagram": { tone: "error", text: "Instagram no respondió. Inténtalo de nuevo en unos minutos; si sigue igual, vuelve a conectar tu cuenta en Redes." },
};

function noticeFor(params: Record<string, string | string[] | undefined>) {
  const traidos = params.traidos;
  if (typeof traidos === "string" && /^\d+$/.test(traidos)) {
    const nuevos = typeof params.nuevos === "string" && /^\d+$/.test(params.nuevos) ? Number(params.nuevos) : 0;
    const base = Number(traidos) === 0
      ? "Revisamos tu Instagram: no hay comentarios ni mensajes nuevos."
      : `Trajimos ${traidos} ${Number(traidos) === 1 ? "comentario o mensaje nuevo" : "comentarios y mensajes nuevos"}${nuevos ? ` y ${nuevos} ${nuevos === 1 ? "contacto nuevo" : "contactos nuevos"} a tus prospectos` : ""}.`;
    const partial = params.parcial === "1" ? " Una parte no respondió; la reintentamos en la próxima revisión." : "";
    return { tone: "ok" as const, text: base + partial };
  }
  for (const key of ["aviso", "error"]) {
    const value = params[key];
    if (typeof value === "string" && notices[`${key}=${value}`]) return notices[`${key}=${value}`];
  }
  return null;
}

const dateFormat = new Intl.DateTimeFormat("es-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" });

/**
 * Comments and direct messages from the professional's connected Instagram.
 * Pulled daily and with "Traer ahora"; each person who writes becomes one
 * prospect in /crm/leads. EVOLUSA never answers or sends messages from here.
 */
export default async function ConversationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [inbox, params] = await Promise.all([getMyInstagramInbox(), searchParams]);
  const notice = noticeFor(params);
  const active = inbox.connection?.status === "ACTIVE";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Conversaciones"
        description="Los comentarios y mensajes de tu Instagram llegan aquí y cada persona queda en tus prospectos. EVOLUSA no responde ni envía mensajes por ti."
      />

      {notice ? (
        <p role="status" className={notice.tone === "ok" ? "rounded-[var(--radius-md)] border border-[var(--success)] bg-white p-4 font-semibold text-[var(--success)]" : "rounded-[var(--radius-md)] border border-[var(--danger)] bg-white p-4 font-semibold text-[var(--danger)]"}>
          {notice.text}
        </p>
      ) : null}

      {!inbox.storageReady ? (
        <p className="rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-4 text-sm leading-6 text-[var(--muted)]">
          {inbox.allowed ? "Las conversaciones todavía se están preparando en EVOLUSA." : "Necesitas un perfil profesional propio para ver conversaciones."}
        </p>
      ) : !active ? (
        <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
          <p className="font-semibold text-[var(--brand-navy)]">Conecta tu Instagram para traer tus comentarios y mensajes.</p>
          <ButtonLink href="/panel-profesional/redes" className="mt-4">Ir a Redes conectadas</ButtonLink>
        </section>
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6">
          <div className="flex items-center gap-3">
            <AtSign aria-hidden size={20} className="text-[var(--brand-blue)]" />
            <p className="text-sm leading-6 text-[var(--muted)]">
              <span className="font-semibold text-[var(--brand-navy)]">@{inbox.connection?.username}</span>
              {" · "}
              {inbox.connection?.inboxSyncedAt ? `Última revisión: ${dateFormat.format(new Date(inbox.connection.inboxSyncedAt))}` : "Aún no hemos revisado tu cuenta."}
              {" Se revisa sola una vez al día."}
            </p>
          </div>
          <form action="/api/social/instagram/inbox" method="post">
            <button type="submit" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-[var(--brand-red)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:bg-[var(--brand-red-strong)]">
              Traer ahora
            </button>
          </form>
        </section>
      )}

      {inbox.items.length ? (
        <ul className="space-y-3">
          {inbox.items.map((item) => (
            <li key={item.id} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {item.kind === "message" ? <MessageCircle aria-hidden size={16} className="text-[var(--brand-blue)]" /> : <MessageSquareText aria-hidden size={16} className="text-[var(--brand-blue)]" />}
                <span className="font-semibold text-[var(--brand-navy)]">@{item.authorUsername}</span>
                <span className="rounded-full bg-[var(--sky-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">{item.kind === "message" ? "Mensaje directo" : "Comentario"}</span>
                <span className="text-[var(--muted)]">{dateFormat.format(new Date(item.occurredAt))}</span>
              </div>
              <p className="mt-2 whitespace-pre-line break-words leading-6 text-[var(--foreground)]">{item.body}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
                {item.leadId ? <Link href={`/crm/leads/${item.leadId}`} className="text-[var(--brand-blue)] underline">Ver prospecto</Link> : null}
                <a href={item.permalink ?? "https://www.instagram.com/direct/inbox/"} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-blue)] underline">
                  {item.kind === "message" ? "Responder en Instagram" : "Ver en Instagram"}
                </a>
              </div>
            </li>
          ))}
        </ul>
      ) : active ? (
        <p className="text-sm leading-6 text-[var(--muted)]">Todavía no hay comentarios ni mensajes. Pulsa “Traer ahora” para revisar tu cuenta.</p>
      ) : null}

      <ButtonLink href="/crm/leads" variant="secondary">Revisar mis prospectos</ButtonLink>
    </div>
  );
}
