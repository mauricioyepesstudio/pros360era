import Link from "next/link";
import { AtSign, CalendarDays, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";
import { requireProfessionalArea } from "@/lib/account/role-gate";
import { getMyInstagramState } from "@/lib/social/connections";
import { disconnectInstagramAction } from "./actions";

const notices: Record<string, { tone: "ok" | "error"; text: string }> = {
  "conectado=instagram": { tone: "ok", text: "Tu Instagram quedó conectado." },
  "desconectado=instagram": { tone: "ok", text: "Desconectamos tu Instagram y borramos de EVOLUSA la llave de acceso y los datos de la cuenta." },
  "error=cancelado": { tone: "error", text: "No se completó la conexión. Puedes intentarlo de nuevo cuando quieras." },
  "error=sesion": { tone: "error", text: "La conexión no coincidió con tu sesión. Vuelve a intentarlo desde este botón." },
  "error=cuenta_en_uso": { tone: "error", text: "Esa cuenta de Instagram ya está conectada a otro perfil de EVOLUSA." },
  "error=instagram": { tone: "error", text: "Instagram no aceptó la conexión. Revisa que tu cuenta sea profesional (empresa o creador) e inténtalo de nuevo." },
  "error=no_configurado": { tone: "error", text: "La conexión con Instagram todavía no está activa en EVOLUSA." },
  "error=desconectar": { tone: "error", text: "No pudimos desconectar tu cuenta. Inténtalo de nuevo." },
};

function noticeFor(params: Record<string, string | string[] | undefined>) {
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
  const [state, params] = await Promise.all([getMyInstagramState(), searchParams]);
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
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Tus publicaciones marcadas como listas se podrán publicar a su hora.</p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
            <Users aria-hidden size={20} className="text-[var(--brand-blue)]" />
            <p className="mt-2 font-semibold text-[var(--brand-navy)]">Clientes</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Los comentarios y mensajes de tu cuenta llegarán a tu CRM para ayudarte a darles seguimiento.</p>
          </li>
          <li className="rounded-[var(--radius-md)] border border-[var(--border)] p-4">
            <ShieldCheck aria-hidden size={20} className="text-[var(--brand-blue)]" />
            <p className="mt-2 font-semibold text-[var(--brand-navy)]">Tu control</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Guardamos la llave de acceso cifrada y puedes desconectar cuando quieras.</p>
          </li>
        </ul>
      </section>

      <p className="text-sm leading-6 text-[var(--muted)]">
        Facebook, TikTok y LinkedIn vienen después de Instagram. Cómo tratamos tus datos: <Link href="/privacidad" className="font-semibold text-[var(--brand-blue)] underline">política de privacidad</Link>.
      </p>
    </div>
  );
}
