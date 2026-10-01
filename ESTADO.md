# ESTADO — EVOLUSA

_Actualizado: 2026-09-30 (desde `git log` en `main` = `c4b3cfa`). Mantener con el agente `estado-keeper`._

## Objetivo actual
**Reclutar profesionales y crecer miembros** en las próximas semanas (respuesta del dueño, 2026-09-30). Stripe Live **no** es prioridad.

## Siguiente (máx. 5; una tarea = un PR)
1. **Kit de reclutamiento de profesionales**: pulir `docs/marketing/professional-recruitment-outreach.md` y la página `/aplicar-profesional` (copy alineado a `claims.ts`; solo categorías no reguladas: marketing y operaciones de negocio en Florida). Pasa por `compliance-reviewer`.
2. **Activar captación en `/aplicar-profesional`**: el flujo depende de la tabla `professional_applications` (existe en vivo, 0 filas); verificar el camino completo de extremo a extremo y el mensaje de fallback. Sin aplicar migraciones.
3. **Adquisición de miembros**: plan de 4 semanas (canales, guías SEO, calendario social) con `growth-marketing-strategist` + `social-content-lead`; ampliar `app/guias` con 1–2 guías nuevas en español.
4. **Métricas de embudo**: definir y medir registro → diagnóstico → Roadmap → oportunidad (`docs/EVOLUSA-LAUNCH-METRICS.md`, `lib/opportunities/analytics.ts`), con datos reales.
5. **Actualizar README, `ci.yml` y `docs/CURRENT-STATE.md`** (desfasados) para que un profesional nuevo o un colaborador entienda el proyecto.

_Plan de migraciones (0015/0017) y revisión de Growth Automation están documentados abajo y en `docs/cerebro/decisiones.md`; no se ejecutan aún._

## En curso / Bloqueado
- **Bloqueado — verificar datos**: confirmar que producción (Vercel) usa el proyecto `ovialqdazxkekvqqgdiu` (ver sección abajo).
- **Bloqueado (decisión del dueño)**: **Stripe NO pasa a Live hasta definir la entidad legal que cobra** (`PENDIENTE — decisión del dueño`).
- **Bloqueado (dueño + asesor)**: Growth Automation (reparto 70/30) y demos Laura/1MIGRATION. Regla provisional: **solo categorías NO reguladas** hasta confirmación con asesor.
- **Pendiente**: fotos reales (dueño y Daniela Torres, con su autorización); Marie Fernández (notaria) debe registrarse antes de verificarla; vectores de logo reales.

### Migraciones: estado verificado en Supabase (solo lectura, 2026-09-30, proyecto `ovialqdazxkekvqqgdiu`)
La lista de migraciones registradas en vivo usa otras versiones/nombres que los archivos del repo, por eso la correspondencia es por nombre.

| Repo | Estado en vivo |
|---|---|
| 0001–0004 account schema, RLS, provisioning, advisor fixes | **Aplicadas** |
| 0005 professional_foundation (+ grant fix aplicado aparte) | **Aplicada** |
| 0006 verified_v1 | **Aplicada** |
| 0007 opportunity_engine_v1 (+ anon_execute_fix) | **Aplicada** |
| 0008 opportunity_lifecycle_v1 | **Aplicada** |
| 0009 assistant_messages ownership fix | **Aplicada** |
| 0010 member_opportunity_professional_projection | Sin registro en la lista (podría ser una función; **sin verificar**) |
| 0011 business_operations_category, 0012 booking_url, 0013 notary | Sin registro en la lista; **sin verificar** (cambian constraints/columnas; requiere inspección de esquema) |
| 0014 professional_applications | Tabla `professional_applications` **existe** (RLS on), pero sin registro de migración |
| 0015_professional_profile_media | **Aplicada** (registrada como `evolusa_professional_profile_media`) |
| 0015_connection_fee_v1 | **No aplicada** (no hay tablas de pago) |
| 0016 admin_dashboard_v1 | **No aplicada** (sin evidencia) |
| 0017_crm_leads_contacts_foundation, 0017_professional_portfolio_v1, 0018 crm_conversations, 0019 crm_pipeline_tasks, 20260929 growth_automation | **No aplicadas** (no existen tablas CRM/growth) |

### Bloqueado — verificar datos (investigado 2026-09-30, solo lectura)
- **Proyectos**: la cuenta de Supabase conectada ve **1 solo proyecto**: `mauricioyepesstudio's Project InMigration`, ID `ovialqdazxkekvqqgdiu`, org `eaxhsobbvufhnybrpozs`, us-west-2, `ACTIVE_HEALTHY`, creado 2026-08-21.
- **ID usado por repo/docs**: `ovialqdazxkekvqqgdiu` en docs, migraciones, `scripts/create-1migration.sh` y handoff: **coincide**. `.env.example` solo tiene claves vacías (no fija ID). **No verificado**: la URL real en las variables de Vercel/producción (no se leyeron valores de entorno).
- **Conteo real (SQL `count(*)`)**: `auth.users` 6 (de 2026-08-22 a 2026-09-29), `profiles` 6, `professional_profiles` 3, `professional_applications` 1, `opportunities` 5. No existe tabla `members` (los miembros son `profiles` con rol MEMBER).
- **Corrección**: mi reporte anterior de "0 profesionales / posible reset" era **incorrecto**; venía de `list_tables`, que usa estadísticas estimadas y mostraba 0. **No hubo reset**: los datos existen.
- **Sigue pendiente**: confirmar que Vercel producción apunta a este proyecto; contrastar las 3 filas de `professional_profiles` con los profesionales esperados (Daniela, Mauricio, Marie) y revisar si hay otra org/cuenta de Supabase no conectada a este conector.

### Plan para la numeración duplicada (NO ejecutar todavía)
1. Congelar: no aplicar nada de 0015+ al vivo hasta decidir el orden.
2. Orden propuesto (por dependencia y fecha de commit): `0015_professional_profile_media` (ya aplicada, conserva 0015) → `0016_connection_fee_v1` (antes 0015) → `0017_admin_dashboard_v1` (antes 0016) → `0018_professional_portfolio_v1` (antes 0017) → `0019_crm_leads_contacts_foundation` → `0020_crm_conversations_multichannel` → `0021_crm_pipeline_tasks` → `0022_growth_automation_tables` (renombrado de `20260929_…`).
3. Antes de renombrar: revisar referencias cruzadas (docs, código, dependencias entre 0016/0017) con `migration-steward`.
4. Renombrar solo archivos **no aplicados**; nunca renombrar los aplicados. Un PR.
5. Aplicar una por una a un branch de Supabase (no directo a producción), con `security-reviewer` y `get_advisors`, y aprobación del dueño. Growth/CRM esperan la decisión legal.

## Hecho (desde git log)
- 2026-09-29/30: demo para Laura/1MIGRATION, onboarding y panel profesional, tutorial interactivo.
- 2026-09-27/29: Growth Automation fases 1–3 (dashboard, OAuth/métricas, generación/publicación) y CRM multicanal.
- 2026-09-25/26: Hero de doble camino con 6 etapas; calendario social de septiembre + imágenes JPEG; guías "Abrir negocio en Florida" y "Aparecer en Google gratis".
- 2026-09-24: reconciliación `feat/evolusa-migration` → `main` (6 conflictos).
- 2026-09-11: editor de perfil profesional; CI con Node 24; recomendación de profesional real en oportunidades.
- 2026-09-09/10: subagentes de departamento, equipo marketing/growth; fix de leads perdidos en `/aplicar-profesional`.
- 2026-09-03: pago de conexión con Stripe ($25), panel admin, portafolio en perfiles, identidad/SEO.
- 2026-09-01/02: categoría Notary, Plan de Crédito, `/aplicar-profesional`.
- 2026-08-30/31: revelación segura del profesional emparejado; Start Flow endurecido.

## Registro
- 2026-10-01: `fix/lint-onboarding`: `app/(onboarding)/professional-setup/page.tsx` ya no llama `setState` dentro de un efecto (error `react-hooks/set-state-in-effect`); el paso inicial se deriva de `?instagram_connected=true` con un inicializador de `useState`. Mismo comportamiento. Los demás errores de lint de `main` (any, comillas, require) siguen pendientes y fuera de este alcance.
- 2026-10-01: `fix/admin-create-professional`: `app/api/admin/create-professional` ya no usa `auth.signUp` con la sesión del admin (lo dejaba logueado como el usuario nuevo); ahora usa `auth.admin.createUser` con el cliente service-role (solo servidor, `lib/supabase/service.ts`) tras los chequeos 401/403. Requiere `SUPABASE_SERVICE_ROLE_KEY` en el entorno. `npm run lint` en `main` tiene 19 errores previos fuera de este alcance (any, comillas sin escapar, require); tsc y build pasan.
- 2026-09-30: el dueño respondió: foco en reclutar profesionales y miembros; Stripe Live en pausa hasta definir entidad; Growth/Laura limitado a categorías no reguladas (provisional); verificadas migraciones en Supabase (solo lectura).
- 2026-09-30: verificación de datos en Supabase: 1 proyecto, 6 usuarios, sin reset; corregido el falso hallazgo previo.
- 2026-09-30: creado el segundo cerebro (`CLAUDE.md`, `ESTADO.md`, `docs/cerebro/`, 3 subagentes) en la rama `cerebro`. Sin cambios de código de la app.
