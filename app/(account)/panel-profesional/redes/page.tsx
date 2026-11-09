import Link from "next/link";
import { AtSign, BriefcaseBusiness, CalendarDays, CheckCircle2, Flag, Network, ShieldCheck, Users } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";
import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyFacebookState, getMyInstagramState, getMyLinkedInState, getMyThreadsState } from "@/lib/social/connections";
import { getMyGhlState } from "@/lib/crm/gohighlevel-state";
import { disconnectFacebookAction, disconnectGoHighLevelAction, disconnectInstagramAction, disconnectLinkedInAction, disconnectThreadsAction } from "./actions";

const notices: Record<string, { tone: "ok" | "error"; text: string }> = {
  "conectado=instagram": { tone: "ok", text: "Tu Instagram quedó conectado." },
  "desconectado=instagram": { tone: "ok", text: "Desconectamos tu Instagram y borramos de EVOLUSA la llave de acceso y los datos de la cuenta." },
  "error=cancelado": { tone: "error", text: "No se completó la conexión. Puedes intentarlo de nuevo cuando quieras." },
  "error=sesion": { tone: "error", text: "La conexión no coincidió con tu sesión. Vuelve a intentarlo desde este botón." },
  "error=cuenta_en_uso": { tone: "error", text: "Esa cuenta de Instagram ya está conectada a otro perfil de EVOLUSA." },
  "error=instagram": { tone: "error", text: "Instagram no aceptó la conexión. Revisa que tu cuenta sea profesional (empresa o creador) e inténtalo de nuevo." },
  "error=no_configurado": { tone: "error", text: "La conexión con Instagram todavía no está activa en EVOLUSA." },
  "error=desconectar": { tone: "error", text: "No pudimos desconectar tu cuenta. Inténtalo de nuevo." },
  "conectado=threads": { tone: "ok", text: "Tu cuenta de Threads quedó conectada." },
  "desconectado=threads": { tone: "ok", text: "Desconectamos Threads y borramos la llave de acceso de EVOLUSA." },
  "error=threads": { tone: "error", text: "Threads no aceptó la conexión. Revisa los permisos e inténtalo de nuevo." },
  "error=threads_cancelado": { tone: "error", text: "No se completó la conexión con Threads." },
  "error=threads_en_uso": { tone: "error", text: "Esa cuenta de Threads ya está conectada a otro perfil de EVOLUSA." },
  "error=threads_no_configurado": { tone: "error", text: "La conexión con Threads todavía no está configurada en EVOLUSA." },
  "conectado=linkedin": { tone: "ok", text: "Tu LinkedIn quedó conectado." },
  "desconectado=linkedin": { tone: "ok", text: "Desconectamos tu LinkedIn y borramos de EVOLUSA la llave de acceso." },
  "error=linkedin": { tone: "error", text: "LinkedIn no aceptó la conexión. Inténtalo de nuevo." },
  "error=linkedin_cancelado": { tone: "error", text: "No se completó la conexión con LinkedIn. Puedes intentarlo de nuevo cuando quieras." },
  "error=linkedin_en_uso": { tone: "error", text: "Ese LinkedIn ya está conectado a otro perfil de EVOLUSA." },
  "error=linkedin_no_configurado": { tone: "error", text: "La conexión con LinkedIn todavía no está activa en EVOLUSA." },
  "conectado=facebook": { tone: "ok", text: "Tu página de Facebook quedó conectada." },
  "desconectado=facebook": { tone: "ok", text: "Desconectamos tu página de Facebook y borramos de EVOLUSA la llave de acceso." },
  "error=facebook": { tone: "error", text: "Facebook no aceptó la conexión. Inténtalo de nuevo." },
  "error=facebook_cancelado": { tone: "error", text: "No se completó la conexión con Facebook. Puedes intentarlo de nuevo cuando quieras." },
  "error=facebook_en_uso": { tone: "error", text: "Esa página de Facebook ya está conectada a otro perfil de EVOLUSA." },
  "error=facebook_varias_paginas": { tone: "error", text: "Facebook autorizó varias páginas. No conectamos ninguna para evitar publicar en otra marca. Vuelve a conectar, pulsa Editar acceso en Facebook y selecciona únicamente la página que quieres usar en este perfil." },
  "error=facebook_sin_pagina": { tone: "error", text: "No encontramos una página de Facebook en la que puedas publicar. Al conectar, elige tu página y deja marcado el permiso de publicar." },
  "error=facebook_no_configurado": { tone: "error", text: "La conexión con Facebook todavía no está activa en EVOLUSA." },
  "conectado=gohighlevel": { tone: "ok", text: "GoHighLevel quedó conectado. Tus prospectos nuevos se copiarán a tu cuenta como contactos." },
  "desconectado=gohighlevel": { tone: "ok", text: "Desconectamos GoHighLevel y borramos de EVOLUSA tu llave. Los contactos que ya se copiaron siguen en tu GoHighLevel." },
  "error=ghl_datos": { tone: "error", text: "Revisa el Location ID y la llave de la integración privada: alguno no tiene el formato esperado." },
  "error=ghl_rechazado": { tone: "error", text: "GoHighLevel no aceptó la llave para ese Location ID. Revisa que la integración privada sea de esa subcuenta y tenga los permisos «View Contacts» y «Edit Contacts»." },
  "error=ghl_caido": { tone: "error", text: "GoHighLevel no respondió. Inténtalo de nuevo en unos minutos." },
  "error=ghl_guardar": { tone: "error", text: "No pudimos guardar la conexión. Inténtalo de nuevo." },
  "error=ghl_sin_conexion": { tone: "error", text: "Primero conecta tu GoHighLevel." },
  "error=ghl_no_configurado": { tone: "error", text: "La conexión con GoHighLevel todavía no está activa en EVOLUSA." },
};

function noticeFor(params: Record<string, string | string[] | undefined>) {
  const sent = params.ghl_enviados;
  if (typeof sent === "string" && /^\d{1,3}$/.test(sent)) {
    const failed = typeof params.ghl_fallidos === "string" && /^\d{1,3}$/.test(params.ghl_fallidos) ? Number(params.ghl_fallidos) : 0;
    const text = sent === "0" && !failed ? "No había prospectos nuevos por copiar a GoHighLevel." : `Copiamos ${sent} prospecto(s) a GoHighLevel.${failed ? ` ${failed} no se pudieron copiar; lo reintentamos solos.` : ""}`;
    return { tone: failed ? ("error" as const) : ("ok" as const), text };
  }
  for (const key of ["conectado", "desconectado", "error"]) {
    const value = params[key];
    if (typeof value === "string" && notices[`${key}=${value}`]) return notices[`${key}=${value}`];
  }
  return null;
}

/**
 * Where a professional connects their social accounts. Instagram first
 * (Instagram API with Instagram Login). Shows only what is true today: if
 * the Meta app or the table isn't live yet, it says so instead of a button.
 */
export default async function RedesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireProfessionalArea();
  const [state, facebook, linkedin, threads, gohighlevel, params] = await Promise.all([getMyInstagramState(), getMyFacebookState(), getMyLinkedInState(), getMyThreadsState(), getMyGhlState(), searchParams]);
  const notice = noticeFor(params);
  const connection = state.connection;
  const canConnect = state.allowed && state.configured && state.storageReady;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Panel profesional"
        title="Redes conectadas"
        description="Conecta tus cuentas para que tu planner y tu CRM trabajen con ellas. Nada se publica sin que tú lo marques como listo."
      />

      {notice ? (
        <p role="status" className={notice.tone === "ok" ? "rounded-[var(--radius-md)] border border-[var(--success)] bg-white p-4 font-semibold text-[var(--success)]" : "rounded-[var(--radius-md)] border border-[var(--danger)] bg-white p-4 font-semibold text-[var(--danger)]"}>
          {notice.text}
        </p>
      ) : null}

      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--sky-surface)] text-[var(--brand-blue)]">
              <AtSign aria-hidden size={24} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-[var(--brand-navy)]">Instagram</h2>
              {connection?.status === "ACTIVE" ? (
                <p className="mt-1 flex items-center gap-2 font-semibold text-[var(--success)]">
                  <CheckCircle2 aria-hidden size={18} /> Conectada como @{connection.username}
                </p>
              ) : connection ? (
                <p className="mt-1 font-semibold text-[var(--warning)]">
                  @{connection.username}: {connection.status === "EXPIRED" ? "la conexión venció." : "quitaste el acceso desde Instagram."} Vuelve a conectarla.
                </p>
              ) : (
                <p className="mt-1 text-[var(--muted)]">Cuenta profesional de Instagram (empresa o creador).</p>
              )}
            </div>
          </div>

          {connection?.status === "ACTIVE" ? (
            <form action={disconnectInstagramAction}>
              <button type="submit" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--border)] px-5 text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--sky-surface)]">
                Desconectar
              </button>
            </form>
          ) : canConnect ? (
            // A plain link: the connect route redirects to Instagram and must not be prefetched.
            <a href="/api/social/instagram/connect" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-[var(--brand-red)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:bg-[var(--brand-red-strong)]">
              {connection ? "Volver a conectar" : "Conectar Instagram"}
            </a>
          ) : (
            <span className="rounded-full bg-[var(--sky-surface)] px-4 py-2 text-sm font-semibold text-[var(--muted)]">Aún no disponible</span>
          )}
        </div>

        {!connection && !canConnect ? (
          <p className="mt-6 rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-4 text-sm leading-6 text-[var(--muted)]">
            {state.allowed
              ? "EVOLUSA está terminando la configuración con Meta. Cuando esté lista, aquí aparecerá el botón para conectar tu cuenta."
              : "Necesitas un perfil profesional propio para conectar redes."}
          </p>
        ) : null}

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          <li className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
            <CalendarDays aria-hidden size={20} className="text-[var(--brand-blue)]" />
            <p className="mt-2 font-semibold text-[var(--brand-navy)]">Planner</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Tus publicaciones de Instagram marcadas «Listo para publicar» en el planner salen solas a su hora.</p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
            <Users aria-hidden size={20} className="text-[var(--brand-blue)]" />
            <p className="mt-2 font-semibold text-[var(--brand-navy)]">Clientes</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Los comentarios y mensajes de tu cuenta llegan a tu CRM, en <Link href="/crm/conversations" className="font-semibold text-[var(--brand-blue)] underline">Conversaciones</Link>, para ayudarte a darles seguimiento.</p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
            <ShieldCheck aria-hidden size={20} className="text-[var(--brand-blue)]" />
            <p className="mt-2 font-semibold text-[var(--brand-navy)]">Tu control</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Guardamos la llave de acceso cifrada y puedes desconectar cuando quieras.</p>
          </li>
        </ul>
      </section>

      <FacebookCard state={facebook} />

      <LinkedInCard state={linkedin} />

      <ThreadsCard state={threads} />

      <GoHighLevelCard state={gohighlevel} />

      <p className="text-sm leading-6 text-[var(--muted)]">
        TikTok viene después. GoHighLevel es opcional: solo si ya trabajas con tu propia cuenta. Cómo tratamos tus datos: <Link href="/privacidad" className="font-semibold text-[var(--brand-blue)] underline">política de privacidad</Link>.
      </p>
    </div>
  );
}

function LinkedInCard({ state }: { state: Awaited<ReturnType<typeof getMyLinkedInState>> }) {
  const connection = state.connection;
  const canConnect = state.allowed && state.configured && state.storageReady;
  const expiresAt = connection?.tokenExpiresAt ? new Intl.DateTimeFormat("es-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(connection.tokenExpiresAt)) : null;
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--sky-surface)] text-[var(--brand-blue)]">
            <BriefcaseBusiness aria-hidden size={24} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-[var(--brand-navy)]">LinkedIn</h2>
            {connection?.status === "ACTIVE" ? (
              <>
                <p className="mt-1 flex items-center gap-2 font-semibold text-[var(--success)]">
                  <CheckCircle2 aria-hidden size={18} /> Conectado como {connection.username}
                </p>
                {expiresAt ? <p className="mt-1 text-sm text-[var(--muted)]">LinkedIn pide volver a conectar cada 60 días. La tuya vence el {expiresAt}.</p> : null}
              </>
            ) : connection ? (
              <p className="mt-1 font-semibold text-[var(--warning)]">{connection.username}: la conexión venció. Vuelve a conectarla.</p>
            ) : (
              <p className="mt-1 text-[var(--muted)]">Tu perfil personal de LinkedIn, para publicar desde tu planner.</p>
            )}
          </div>
        </div>

        {connection?.status === "ACTIVE" ? (
          <form action={disconnectLinkedInAction}>
            <button type="submit" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--border)] px-5 text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--sky-surface)]">
              Desconectar
            </button>
          </form>
        ) : canConnect ? (
          // A plain link: the connect route redirects to LinkedIn and must not be prefetched.
          <a href="/api/social/linkedin/connect" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-[var(--brand-red)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:bg-[var(--brand-red-strong)]">
            {connection ? "Volver a conectar" : "Conectar LinkedIn"}
          </a>
        ) : (
          <span className="rounded-full bg-[var(--sky-surface)] px-4 py-2 text-sm font-semibold text-[var(--muted)]">Aún no disponible</span>
        )}
      </div>
      {!connection && !canConnect && state.allowed ? (
        <p className="mt-6 rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-4 text-sm leading-6 text-[var(--muted)]">
          EVOLUSA está terminando la configuración con LinkedIn. Cuando esté lista, aquí aparecerá el botón para conectar tu perfil.
        </p>
      ) : null}
    </section>
  );
}

function FacebookCard({ state }: { state: Awaited<ReturnType<typeof getMyFacebookState>> }) {
  const connection = state.connection;
  const canConnect = state.allowed && state.configured && state.storageReady;
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--sky-surface)] text-[var(--brand-blue)]">
            <Flag aria-hidden size={24} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-[var(--brand-navy)]">Facebook</h2>
            {connection?.status === "ACTIVE" ? (
              <p className="mt-1 flex items-center gap-2 font-semibold text-[var(--success)]">
                <CheckCircle2 aria-hidden size={18} /> Página conectada: {connection.username}
              </p>
            ) : connection ? (
              <p className="mt-1 font-semibold text-[var(--warning)]">{connection.username}: quitaste el acceso desde Facebook. Vuelve a conectarla.</p>
            ) : (
              <p className="mt-1 text-[var(--muted)]">Tu página de Facebook, para que el planner publique en ella posts y Stories.</p>
            )}
          </div>
        </div>

        {connection?.status === "ACTIVE" ? (
          <form action={disconnectFacebookAction}>
            <button type="submit" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--border)] px-5 text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--sky-surface)]">
              Desconectar
            </button>
          </form>
        ) : canConnect ? (
          // A plain link: the connect route redirects to Facebook and must not be prefetched.
          <a href="/api/social/facebook/connect" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-[var(--brand-red)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:bg-[var(--brand-red-strong)]">
            {connection ? "Volver a conectar" : "Conectar Facebook"}
          </a>
        ) : (
          <span className="rounded-full bg-[var(--sky-surface)] px-4 py-2 text-sm font-semibold text-[var(--muted)]">Aún no disponible</span>
        )}
      </div>
      {!connection && !canConnect && state.allowed ? (
        <p className="mt-6 rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-4 text-sm leading-6 text-[var(--muted)]">
          EVOLUSA está terminando la configuración con Facebook. Cuando esté lista, aquí aparecerá el botón para conectar tu página.
        </p>
      ) : null}
    </section>
  );
}

function ThreadsCard({ state }: { state: Awaited<ReturnType<typeof getMyThreadsState>> }) {
  const connection = state.connection;
  const canConnect = state.allowed && state.configured && state.storageReady;
  const expiresAt = connection?.tokenExpiresAt ? new Intl.DateTimeFormat("es-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date(connection.tokenExpiresAt)) : null;
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--sky-surface)] text-[var(--brand-blue)]">
            <AtSign aria-hidden size={24} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-[var(--brand-navy)]">Threads</h2>
            {connection?.status === "ACTIVE" ? (
              <>
                <p className="mt-1 flex items-center gap-2 font-semibold text-[var(--success)]">
                  <CheckCircle2 aria-hidden size={18} /> Conectado como {connection.username}
                </p>
                {expiresAt ? <p className="mt-1 text-sm text-[var(--muted)]">Tu conexión vence el {expiresAt}.</p> : null}
              </>
            ) : connection ? (
              <p className="mt-1 font-semibold text-[var(--warning)]">{connection.username}: la conexión venció. Vuelve a conectarla.</p>
            ) : (
              <p className="mt-1 text-[var(--muted)]">Tu cuenta de Threads, para publicar texto, imágenes y videos desde tu planner.</p>
            )}
          </div>
        </div>

        {connection?.status === "ACTIVE" ? (
          <form action={disconnectThreadsAction}>
            <button type="submit" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--border)] px-5 text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--sky-surface)]">
              Desconectar
            </button>
          </form>
        ) : canConnect ? (
          // A plain link: the connect route redirects to Threads and must not be prefetched.
          <a href="/api/social/threads/connect" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-[var(--brand-red)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:bg-[var(--brand-red-strong)]">
            {connection ? "Volver a conectar" : "Conectar Threads"}
          </a>
        ) : (
          <span className="rounded-full bg-[var(--sky-surface)] px-4 py-2 text-sm font-semibold text-[var(--muted)]">Aún no disponible</span>
        )}
      </div>
      {!connection && !canConnect && state.allowed ? (
        <p className="mt-6 rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-4 text-sm leading-6 text-[var(--muted)]">
          EVOLUSA está terminando la configuración con Threads. Cuando esté lista, aquí aparecerá el botón para conectar tu perfil.
        </p>
      ) : null}
    </section>
  );
}

function GoHighLevelCard({ state }: { state: Awaited<ReturnType<typeof getMyGhlState>> }) {
  const connection = state.connection;
  const canConnect = state.allowed && state.configured && state.storageReady;
  const date = (value: string | null) => (value ? new Intl.DateTimeFormat("es-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(value)) : null);
  const input = "mt-1 block w-full rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--brand-navy)]";
  return (
    <section id="gohighlevel" className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--sky-surface)] text-[var(--brand-blue)]">
            <Network aria-hidden size={24} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-[var(--brand-navy)]">GoHighLevel <span className="ml-1 rounded-full bg-[var(--sky-surface)] px-3 py-1 align-middle text-xs font-semibold text-[var(--muted)]">Opcional</span></h2>
            {connection?.status === "ACTIVE" ? (
              <>
                <p className="mt-1 flex items-center gap-2 font-semibold text-[var(--success)]">
                  <CheckCircle2 aria-hidden size={18} /> Conectado{connection.locationName ? ` a ${connection.locationName}` : ""}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Location ID {connection.locationId} · {connection.sent} prospecto(s) copiados{connection.failed ? ` · ${connection.failed} pendientes de reintento` : ""}
                  {connection.lastSyncedAt ? ` · último envío ${date(connection.lastSyncedAt)}` : ""}
                </p>
                {connection.lastError ? <p className="mt-1 text-sm font-semibold text-[var(--warning)]">{connection.lastError}</p> : null}
              </>
            ) : connection ? (
              <p className="mt-1 font-semibold text-[var(--warning)]">{connection.lastError ?? "GoHighLevel dejó de aceptar la llave."} Vuelve a conectarlo abajo.</p>
            ) : (
              <p className="mt-1 text-[var(--muted)]">Si ya usas GoHighLevel, cada prospecto nuevo de tu CRM de EVOLUSA se copia a tu cuenta como contacto.</p>
            )}
          </div>
        </div>

        {connection ? (
          <div className="flex flex-wrap gap-3">
            {connection.status === "ACTIVE" ? (
              <form action="/api/crm/gohighlevel/sync" method="post">
                <button type="submit" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-[var(--brand-red)] px-5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:bg-[var(--brand-red-strong)]">
                  Enviar ahora
                </button>
              </form>
            ) : null}
            <form action={disconnectGoHighLevelAction}>
              <button type="submit" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--border)] px-5 text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--sky-surface)]">
                Desconectar
              </button>
            </form>
          </div>
        ) : !canConnect ? (
          <span className="rounded-full bg-[var(--sky-surface)] px-4 py-2 text-sm font-semibold text-[var(--muted)]">Aún no disponible</span>
        ) : null}
      </div>

      {canConnect && connection?.status !== "ACTIVE" ? (
        <form action="/api/crm/gohighlevel/connect" method="post" className="mt-6 grid gap-4 rounded-[var(--radius-md)] border border-[var(--border)] p-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--brand-navy)]">
            Location ID
            <input name="locationId" required autoComplete="off" spellCheck={false} pattern="[A-Za-z0-9]{8,64}" defaultValue={connection?.locationId ?? ""} className={input} />
          </label>
          <label className="text-sm font-semibold text-[var(--brand-navy)]">
            Llave de la integración privada
            <input name="token" type="password" required autoComplete="off" spellCheck={false} className={input} />
          </label>
          <p className="text-sm leading-6 text-[var(--muted)] sm:col-span-2">
            En tu subcuenta de GoHighLevel: Settings → Business Profile (Location ID) y Settings → Private Integrations → Create new integration, con los permisos «View Contacts» y «Edit Contacts». Guardamos la llave cifrada; nunca se muestra de nuevo. EVOLUSA solo crea o actualiza contactos: no envía mensajes desde tu GoHighLevel.
          </p>
          <div className="sm:col-span-2">
            <button type="submit" className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-[var(--brand-red)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-sm)] hover:bg-[var(--brand-red-strong)]">
              {connection ? "Volver a conectar" : "Conectar GoHighLevel"}
            </button>
          </div>
        </form>
      ) : null}

      {!connection && !canConnect && state.allowed ? (
        <p className="mt-6 rounded-[var(--radius-md)] bg-[var(--sky-surface)] p-4 text-sm leading-6 text-[var(--muted)]">
          EVOLUSA está terminando de activar la conexión con GoHighLevel. Cuando esté lista, aquí podrás pegar los datos de tu cuenta.
        </p>
      ) : null}
    </section>
  );
}
