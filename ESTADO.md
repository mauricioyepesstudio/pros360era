# ESTADO — EVOLUSA

_Actualizado: 2026-10-06 (formulario de profesionales en producción; resto desde `git log` en `main` = `c4b3cfa`). Mantener con el agente `estado-keeper`._

## Objetivo actual
**Reclutar profesionales y crecer miembros** en las próximas semanas (respuesta del dueño, 2026-09-30). Stripe Live **no** es prioridad.

## Siguiente (máx. 5; una tarea = un PR)
1. **Kit de reclutamiento de profesionales**: pulir `docs/marketing/professional-recruitment-outreach.md` y la página `/aplicar-profesional` (copy alineado a `claims.ts`; solo categorías no reguladas: marketing y operaciones de negocio en Florida). Pasa por `compliance-reviewer`.
2. **Captación en `/aplicar-profesional`: HECHO 2026-10-06** (PR #19). Siguiente paso: revisar cada semana las solicitudes `PENDING` (runbook en `supabase/migrations/0014_…`) y contactar a quien aplique.
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
| 20261006 professional_applications insert grant + índice anti-duplicados | **Aplicada 2026-10-06** con OK del dueño (registrada como `evolusa_professional_applications_insert_grant`). Verificado: anon/authenticated solo INSERT por columna; sin SELECT; `status` no insertable. |
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
- 2026-10-06: `/aplicar-profesional` estaba apagado (bandera en false) y la base viva no tenía el GRANT INSERT por columnas de 0014, así que todo envío fallaba. PR #19: formulario encendido solo con categorías no reguladas (Marketing, Operaciones, Otro), validación + honeypot, sin duplicados; migración `20261006_…` aplicada y probada con insert anónimo en transacción revertida. PR #20: `main` sin errores de lint (CI completo en verde). PR #21: `/professional-laura-demo` despublicada (404) por decisión del dueño.
- 2026-10-01: `fix/professional-inserts-v2` (desde `main` con #12 y #13): `create-professional` y `scripts/create-laura-account.js` escribían columnas inexistentes (`business_name`, `niche`, `location`, `instagram`, `website`; en `profiles`: `email`, `full_name`, `bio`) y a `user_services`, tabla que ninguna migración crea; todo fallaba y la ruta respondía 201. Ahora usan las columnas reales (`lib/professional/admin-provisioning.ts`, con tests), cualquier error devuelve 500 y borra el usuario a medio crear. Sin asignación de Growth (tablas no aplicadas). Solo categorías no reguladas desde la ruta admin.
- 2026-10-01: `fix/lint-onboarding`: `app/(onboarding)/professional-setup/page.tsx` ya no llama `setState` dentro de un efecto (error `react-hooks/set-state-in-effect`); el paso inicial se deriva de `?instagram_connected=true` con un inicializador de `useState`. Mismo comportamiento. Los demás errores de lint de `main` (any, comillas, require) siguen pendientes y fuera de este alcance.
- 2026-10-01: `fix/admin-create-professional`: `app/api/admin/create-professional` ya no usa `auth.signUp` con la sesión del admin (lo dejaba logueado como el usuario nuevo); ahora usa `auth.admin.createUser` con el cliente service-role (solo servidor, `lib/supabase/service.ts`) tras los chequeos 401/403. Requiere `SUPABASE_SERVICE_ROLE_KEY` en el entorno. `npm run lint` en `main` tiene 19 errores previos fuera de este alcance (any, comillas sin escapar, require); tsc y build pasan.
- 2026-09-30: el dueño respondió: foco en reclutar profesionales y miembros; Stripe Live en pausa hasta definir entidad; Growth/Laura limitado a categorías no reguladas (provisional); verificadas migraciones en Supabase (solo lectura).
- 2026-09-30: verificación de datos en Supabase: 1 proyecto, 6 usuarios, sin reset; corregido el falso hallazgo previo.
- 2026-09-30: creado el segundo cerebro (`CLAUDE.md`, `ESTADO.md`, `docs/cerebro/`, 3 subagentes) en la rama `cerebro`. Sin cambios de código de la app.

## 2026-10-06 — corrección de disponibilidad de Growth/CRM

Preparado en checkout aislado desde `7e6eaecb475c1981dbdf5436acd4e36fd138d418`: Growth muestra “en preparación”; sus APIs retornan 503 antes de cualquier conexión/generación/publicación. No se implementó OAuth real ni persistencia de tokens. CRM deja de convertir errores de base de datos en ceros, valida la respuesta y permite reintentar sin romper el formateo.

Verificación de esquema vivo de solo lectura realizada por el agente coordinador: no existen en `public` `crm_leads`, `crm_conversations`, `crm_tasks`, `crm_opportunities`, `growth_automation_profiles` ni `social_media_accounts`. No aplicar migraciones dentro de esta entrega. El CRM no está funcional en producción hasta resolver su esquema bajo las aprobaciones correspondientes; no confundir ausencia de tablas con ausencia de contactos. Falta validar un recorrido autenticado real; no se dispone de una cuenta de prueba en esta entrega.

Validación local: 86 pruebas pasan (4 regresiones nuevas); ESLint sin errores (12 advertencias existentes), `tsc --noEmit`, build de producción y `git diff --check` pasan. Invocación directa de los 7 handlers compilados de Growth: todos devuelven 503 sin redirección. No es una prueba HTTP ni de producción. Revisión independiente security/compliance: GO para indisponibilidad segura y manejo de errores, no para OAuth funcional. Pendiente PR/CI/despliegue y comprobación del commit real de producción por el coordinador.

## 2026-10-06 — CRM manual preparado; esquema vivo sin aplicar

Checkout aislado desde `ef9473f`: migración generada con CLI `20261006184204_crm_manual_capture_v1.sql`, solo `crm_leads` y `crm_contacts`. Propiedad por `auth.uid()`, RLS de dueño + rol PROFESSIONAL/ADMIN, SELECT e INSERT limitados a campos de captura, consentimiento false; sin UPDATE/DELETE/TRUNCATE ni comunicación automática. Formularios/lista API validan campos y rol de servidor; `/crm/leads/new` permite captura manual cuando el esquema esté autorizado y aplicado. Dashboard conserva cifras reales de prospectos; conversaciones/tareas/pipeline permanecen null y “En preparación”. Growth sigue deshabilitado.

Metadatos vivos revisados por coordinador el 2026-10-06: tablas leads/contacts ausentes; ledger de 14 entradas sin los tres borradores CRM 0017/0018/0019. Esos borradores inválidos fueron movidos a `supabase/drafts/` sin cambiar sus bytes. No usar blanket db push: otros pendientes y colisiones históricas permanecen. Runbook exacto de aprobación/aplicación y rollback de acceso sin borrar datos: `docs/CRM-MANUAL-CAPTURE-APPLY.md`.

Validación: `npm ci`, ESLint (0 errores, 7 advertencias existentes), `tsc --noEmit`, 91 pruebas, build de producción y diff check pasan. Cinco pruebas nuevas incluyen ejecución real del SQL en PostgreSQL PGlite con usuarios sintéticos: aislamientos de dueño/rol, denegación de dueño/status/consentimiento y UPDATE/DELETE/TRUNCATE, opt-ins false, duplicados por email y rollback que preserva datos. Revisor independiente arquitecto/steward/security/compliance: PASS. Invocación directa de 7 handlers CRM compilados sin configuración: 503; no prueba HTTP ni autenticada. No se cambió ninguna base viva, secreto, permiso existente ni cuenta. Pendientes: aprobación explícita de este esquema/grants, PR/CI/despliegue y prueba con sesiones profesionales/miembro autorizadas; no afirmar persistencia real en producción antes de completarlo.
