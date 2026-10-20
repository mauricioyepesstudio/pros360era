/**
 * Jarvis — el "cerebro" de EVOLUSA visto por el dueño (/admin/cerebro).
 *
 * Fotografía curada a mano del estado del producto: qué módulo del cerebro
 * está en producción, cuál está listo en código pero falta configuración, qué
 * está bloqueado y qué toca hacer hoy. Cada estado cita su evidencia (PR o
 * nota de ESTADO.md) para que nadie lo tome como dato en vivo. Se actualiza
 * en el mismo PR que cambia el módulo.
 *
 * Datos puros, sin React ni Supabase, para poder probarlo con node --test.
 */

export type BrainModuleStatus = "live" | "ready" | "building" | "pending" | "blocked";

export type BrainArea = "Captación" | "Redes" | "Contenido" | "Plataforma" | "Ingresos";

export type BrainModule = {
  id: string;
  name: string;
  area: BrainArea;
  status: BrainModuleStatus;
  /** Qué hace, en una línea. */
  summary: string;
  /** Qué falta o qué limita hoy. */
  next: string;
  /** De dónde sale el estado: PRs o notas, nunca una cifra inventada. */
  evidence: string;
  /** Posición en la rejilla isométrica 0..6 (el núcleo ocupa el centro). */
  grid: { x: number; y: number };
  /** Cuenta para el portón "no invitar profesionales hasta que funcione". */
  launchGate: boolean;
};

export const BRAIN_STATUS_LABEL: Record<BrainModuleStatus, string> = {
  live: "En producción",
  ready: "Listo en código",
  building: "En construcción",
  pending: "Pendiente",
  blocked: "Bloqueado",
};

export const BRAIN_MODULES: readonly BrainModule[] = [
  {
    id: "crm",
    name: "CRM de Instagram",
    area: "Captación",
    status: "live",
    summary: "Comentarios y mensajes de Instagram entran a Clientes → Conversaciones como prospectos.",
    next: "Sincroniza una vez al día más el botón «Traer ahora»; no responde nada automáticamente.",
    evidence: "PR #43",
    grid: { x: 1, y: 1 },
    launchGate: true,
  },
  {
    id: "instagram",
    name: "Conexión Instagram",
    area: "Redes",
    status: "live",
    summary: "Cada profesional conecta su cuenta; token cifrado que se renueva solo.",
    next: "Solo cuentas Instagram Tester hasta tener entidad legal y revisión de Meta.",
    evidence: "PR #42",
    grid: { x: 3, y: 0 },
    launchGate: true,
  },
  {
    id: "planner",
    name: "Planner de publicaciones",
    area: "Contenido",
    status: "live",
    summary: "Calendario, imágenes propias, importación de parrillas y arte generado.",
    next: "Recorrido autenticado completo del dueño aún sin verificar en navegador.",
    evidence: "PR #42, #51 y 09af871",
    grid: { x: 5, y: 1 },
    launchGate: true,
  },
  {
    id: "autopost",
    name: "Publicación automática",
    area: "Contenido",
    status: "ready",
    summary: "El reloj en Supabase publica posts y Stories en Instagram y la página de Facebook a su hora.",
    next: "Confirmar la primera publicación real programada de punta a punta.",
    evidence: "PR #46, #47, #49 y #50",
    grid: { x: 6, y: 3 },
    launchGate: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    area: "Redes",
    status: "ready",
    summary: "Conexión del perfil personal desde Redes y enlaces públicos de empresa.",
    next: "Confirmar app de LinkedIn y credenciales en Vercel; el token dura 60 días.",
    evidence: "PR #44 y #58",
    grid: { x: 5, y: 5 },
    launchGate: true,
  },
  {
    id: "facebook",
    name: "Facebook",
    area: "Redes",
    status: "building",
    summary: "Publicación en la página de Facebook con la misma app de Meta.",
    next: "Mismos límites de tester que Instagram; falta la lectura de mensajes al CRM.",
    evidence: "PR #47 y #50",
    grid: { x: 3, y: 6 },
    launchGate: true,
  },
  {
    id: "leads",
    name: "Captación de profesionales",
    area: "Captación",
    status: "live",
    summary: "Formulario /aplicar-profesional, revisión en Admin y videollamada inicial.",
    next: "Revisar cada semana las solicitudes pendientes.",
    evidence: "PR #19 y #39",
    grid: { x: 1, y: 5 },
    launchGate: true,
  },
  {
    id: "email",
    name: "Correo de registro",
    area: "Plataforma",
    status: "blocked",
    summary: "Confirmación de cuenta por correo (Resend vía Supabase SMTP).",
    next: "Resend en modo prueba rechaza a usuarios reales: verificar dominio y cambiar remitente.",
    evidence: "ESTADO.md 2026-10-18",
    grid: { x: 0, y: 3 },
    launchGate: true,
  },
  {
    id: "roadmap",
    name: "Roadmap de 6 etapas",
    area: "Plataforma",
    status: "live",
    summary: "Journey del miembro con su próximo paso y el asistente EvolUSAia.",
    next: "Medir el embudo registro → diagnóstico → Roadmap → conexión.",
    evidence: "PR #61",
    grid: { x: 6, y: 6 },
    launchGate: false,
  },
  {
    id: "stripe",
    name: "Cobros (Stripe)",
    area: "Ingresos",
    status: "pending",
    summary: "Tarifa de conexión en Sandbox.",
    next: "No pasa a Live hasta definir la entidad legal que cobra.",
    evidence: "Regla del dueño",
    grid: { x: 0, y: 0 },
    launchGate: false,
  },
];

export type DailyTask = {
  id: string;
  title: string;
  why: string;
  owner: "Tú" | "Jarvis";
  area: BrainArea;
  /** Mientras el módulo siga bloqueado, la tarea aparece todos los días. */
  pinnedWhileBlocked?: string;
};

export const DAILY_TASK_POOL: readonly DailyTask[] = [
  {
    id: "resend-domain",
    title: "Verificar un dominio propio en Resend y cambiar el remitente SMTP en Supabase",
    why: "Sin esto ningún usuario real puede terminar su registro.",
    owner: "Tú",
    area: "Plataforma",
    pinnedWhileBlocked: "email",
  },
  {
    id: "review-applications",
    title: "Revisar las aplicaciones pendientes de profesionales",
    why: "Cada solicitud sin respuesta enfría a un profesional interesado.",
    owner: "Tú",
    area: "Captación",
  },
  {
    id: "crm-triage",
    title: "Abrir Clientes → Conversaciones y clasificar los prospectos nuevos",
    why: "El CRM trae comentarios y mensajes; alguien tiene que decidir a quién responder.",
    owner: "Tú",
    area: "Captación",
  },
  {
    id: "plan-post",
    title: "Dejar programada una publicación en el planner",
    why: "La constancia en redes es la primera fuente de prospectos.",
    owner: "Tú",
    area: "Contenido",
  },
  {
    id: "e2e-autopost",
    title: "Probar una publicación programada de punta a punta en una cuenta tester",
    why: "Es el último paso para dar por bueno el posteo automático.",
    owner: "Jarvis",
    area: "Contenido",
  },
  {
    id: "tester-status",
    title: "Confirmar qué cuentas de Instagram ya aceptaron la invitación de tester",
    why: "Solo las cuentas tester pueden conectarse mientras la app de Meta está en desarrollo.",
    owner: "Tú",
    area: "Redes",
  },
  {
    id: "linkedin-check",
    title: "Comprobar que la conexión de LinkedIn funciona con una cuenta real",
    why: "El código está listo; falta confirmar la app y las credenciales.",
    owner: "Tú",
    area: "Redes",
  },
  {
    id: "facebook-crm",
    title: "Diseñar la lectura de mensajes de Facebook hacia el CRM",
    why: "Así Facebook se suma al mismo cerebro que Instagram, no como parche aparte.",
    owner: "Jarvis",
    area: "Redes",
  },
  {
    id: "new-guide",
    title: "Redactar una guía nueva en español para /guias",
    why: "Las guías atraen miembros por búsqueda orgánica.",
    owner: "Jarvis",
    area: "Contenido",
  },
  {
    id: "funnel-metrics",
    title: "Medir el embudo registro → diagnóstico → Roadmap → conexión",
    why: "Sin el embudo medido no sabemos dónde se cae la gente.",
    owner: "Jarvis",
    area: "Plataforma",
  },
  {
    id: "copy-review",
    title: "Revisar el copy público contra claims.ts",
    why: "Nada de cifras prometidas y siempre «perfil aprobado».",
    owner: "Jarvis",
    area: "Plataforma",
  },
  {
    id: "legal-entity",
    title: "Avanzar en la definición de la entidad legal",
    why: "Desbloquea Stripe Live y la revisión de Meta para abrir redes a todos.",
    owner: "Tú",
    area: "Ingresos",
  },
  {
    id: "recruit-kit",
    title: "Pulir el kit de reclutamiento de profesionales",
    why: "Queda listo para el día en que el flujo funcione de punta a punta.",
    owner: "Jarvis",
    area: "Captación",
  },
];

/** Cuántas tareas rotativas se suman cada día a las fijas. */
export const ROTATING_TASKS_PER_DAY = 3;

/** "2026-10-20" → número estable para rotar las tareas. */
function daySeed(dayKey: string): number {
  const [year, month, day] = dayKey.split("-").map(Number);
  if (!year || !month || !day) return 0;
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/**
 * Tareas del día: primero las fijadas a un módulo bloqueado, luego una
 * rotación determinista del resto (mismo día → mismas tareas).
 */
export function tasksForDay(
  dayKey: string,
  modules: readonly BrainModule[] = BRAIN_MODULES,
  pool: readonly DailyTask[] = DAILY_TASK_POOL,
): DailyTask[] {
  const blocked = new Set(modules.filter((module) => module.status === "blocked").map((module) => module.id));
  const pinned = pool.filter((task) => task.pinnedWhileBlocked && blocked.has(task.pinnedWhileBlocked));
  const rotating = pool.filter((task) => !task.pinnedWhileBlocked);
  if (rotating.length === 0) return pinned;
  const start = (daySeed(dayKey) * ROTATING_TASKS_PER_DAY) % rotating.length;
  const count = Math.min(ROTATING_TASKS_PER_DAY, rotating.length);
  const picked = Array.from({ length: count }, (_, index) => rotating[(start + index) % rotating.length]);
  return [...pinned, ...picked];
}

/** Fecha del día en Florida, para que todos vean las mismas tareas. */
export function brainDayKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** El portón de lanzamiento: cuántos módulos necesarios ya están en producción. */
export function launchReadiness(modules: readonly BrainModule[] = BRAIN_MODULES) {
  const gate = modules.filter((module) => module.launchGate);
  const live = gate.filter((module) => module.status === "live");
  return {
    live: live.length,
    total: gate.length,
    missing: gate.filter((module) => module.status !== "live"),
    ready: gate.length > 0 && live.length === gate.length,
  };
}
