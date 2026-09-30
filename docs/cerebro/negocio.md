# Negocio

Fuentes: `docs/EVOLUSA-PLATFORM-BLUEPRINT.md`, `EVOLUSA-PROFESSIONAL-NETWORK.md`, `EVOLUSA-LAUNCH-*.md`, `GROWTH-AUTOMATION.md`, `.claude/handoff-2026-09-04.md`.

## Modelo
- **Lado demanda**: miembros gratis (Journey, Roadmap, asistente, Plan de Crédito, guías).
- **Lado oferta**: profesionales verificados reciben oportunidades cualificadas con consentimiento del miembro.
- **Ingreso actual**: ninguno real. Tarifa de **$25 por conexión** construida (Stripe, `lib/stripe/config.ts`), en Sandbox; **Live en pausa hasta definir la entidad legal** (decisión 2026-09-30).
- **Foco actual**: reclutar profesionales y crecer miembros.
- **Diseñado, no construido**: suscripción plana, cita, colocación patrocinada para `SERVICE_BUSINESS`; para `REGULATED` solo suscripción/herramientas (sin fee por lead/cita por riesgo de fee-splitting).
- **Growth Automation** (lanzado 2026-09-28, fase 1–3): servicio para profesionales (publicación, respuestas IA, WhatsApp, analítica) con reparto declarado 70% profesional / 30% plataforma. **Sin revisar de cumplimiento; limitado provisionalmente a categorías NO reguladas.**
- **CRM** multicanal propio (migraciones 0017–0019).

## Operación
- Owner: Mauricio; entidad operativa citada en copy: "Real Group Entertainment LLC" (sin confirmar en `config/brand.ts`; **entidad que cobra: PENDIENTE — decisión del dueño**).
- Cuenta Stripe: "Auto Flow Systems" (activada). Supabase `ovialqdazxkekvqqgdiu`; Vercel `evolusa`.
- Primeros profesionales: Daniela Torres (demo aprobada, sin verificar), Mauricio, Marie Fernández (notaria, pendiente de registro). Piloto con Laura / 1MIGRATION.
- Métricas objetivo: `docs/EVOLUSA-LAUNCH-METRICS.md` (p. ej. 250 perfiles completos/semana; sin datos reales aún).

## Pendiente de completar
- Ingresos reales, nº de conexiones, conversión.
- Precio/planes para profesionales.
- Estructura legal y fiscal de la entidad que cobra.
- Costos (Supabase, Vercel, Anthropic API, Stripe fees).
- Plan de adquisición de profesionales (hay borradores en `docs/marketing/`).
