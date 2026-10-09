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
- 2026-10-09: perfil preparado de Miguel (José Miguel Acosta): kit `miguel-acosta` en `data/professional/prepared-kits.ts` (trayectoria desde su HV, LinkedIn, Personal CFO como sitio web, categoría BUSINESS_OPERATIONS, virtual) + 21 creativos en `public/professionals/kits/miguel-acosta/`. `/api/admin/create-professional` acepta `preparedKit` y lo guarda en `app_metadata` (solo service role). El panel muestra la bienvenida y `/panel-profesional/creativos`. **Falta**: crear la cuenta con su correo real desde una sesión ADMIN; aprobar el perfil aparte. Precios del concepto 07 sin confirmar.
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


### 2026-10-06 — CRM manual activado, PR28 integrado

- Owner autorizó expresamente la migración después de revisar el alcance de dos tablas. Revisión de seguridad y CI aprobados: 91 pruebas, TypeScript, lint y build.
- PR28 integrado: a8a144cbf69100460249076a20e345f9e6af410c. Migración viva crm_manual_capture_v1, ledger 20261006185802, proyecto ovialqdazxkekvqqgdiu.
- crm_leads y crm_contacts creadas. Metadatos vivos confirman RLS y dos políticas por tabla, sin lectura anon, sin UPDATE/DELETE ni INSERT de user_id para authenticated. Consentimientos por defecto false. No se activó OAuth ni envío de mensajes.
- Función: /crm/leads/new → listado → métricas de leads persistidos. Preview READY del commit fuente; despliegue de producción en verificación al redactar esta nota.
- Límite: falta sesión profesional de prueba para validar guardado/listado/dashboard y aislamiento en Data API con dos propietarios reales de prueba. No se afirma recorrido autenticado verificado.
- Advisors sin hallazgos sobre las dos tablas nuevas; quedan hallazgos en objetos anteriores (vista pública SECURITY DEFINER, RPC y protección de contraseñas), fuera de esta migración.
- El runbook CRM-MANUAL-CAPTURE-APPLY.md conserva el plan previo a activación como referencia; esta nota actualiza su estado. Próximo objetivo: prueba autenticada y seguimiento operativo del prospecto, sin inventar datos o automatizaciones.

## 2026-10-06 — entrada de cuenta y confirmación honestas

Preparado desde `a8a144c`: el signup no afirma que envió correo cuando Supabase devuelve respuesta genérica; ofrece login, corregir correo y reenvío auténtico con cooldown visual de 60 segundos y errores del proveedor. Login con correo no confirmado ofrece recuperación. El encabezado “Ya tengo cuenta” distingue Soy usuario/Soy profesional sin agregar botones al espacio principal. Ambas entradas usan la misma cuenta; MEMBER conserva presentación privada, PROFESSIONAL existente se dirige al panel leyendo su rol propio tras autenticar. No se eleva ningún rol ni se omite confirmación. La API legacy `/api/auth/professional-signup`, sin referencias en código de app, ahora devuelve 410 con la entrada canónica; ya no intenta autoprovisionar PROFESSIONAL ni anuncia un destino inexistente.

No se enviaron correos reales ni se cambiaron configuración Auth, secretos, roles, permisos, esquema o datos. Las pruebas del proveedor usan dobles locales, no un servicio simulado en producto. Confirmación en buzón y recorrido autenticado real permanecen pendientes; no inferir falla SMTP a partir de una pantalla genérica de signup.

Validación local de esta entrada: ESLint 0 errores/7 advertencias existentes, TypeScript, 96 pruebas (5 nuevas de confirmación/reenvío/destino), build de producción y diff check pasan. Revisor independiente security/product/compliance: PASS; cinco pruebas nuevas pasan también en su revisión. Endpoint retirado probado por invocación directa del handler compilado: 410 sin redirección ni llamadas de autenticación. Pruebas de dropdown/responsive y confirmación en buzón/recorrido autenticado quedan para verificación de navegador; no se inventan aquí.


## 2026-10-07 — contexto profesional separado de la cuenta personal

PR #31 integrado en `9e3587351bc493df5cb0c6cbb67a75cf902d2551` y despliegue de producción READY `dpl_FnfUFzGSc8Z1yA34Xb2W6o6AxNFm`. Una cuenta MEMBER que entra en `/dashboard/professional` ahora ve un **Espacio profesional** identificado como **Borrador privado**, con navegación limitada a Presentación y Mi cuenta. Roadmap, Conexiones y Perfil personal quedan fuera de este contexto. Un rol PROFESSIONAL que abre la ruta del borrador se redirige a `/panel-profesional`. No se cambiaron roles, RLS, esquema, datos, OAuth, cobros ni servicios regulados.

Validación: 99 pruebas, TypeScript, lint sin errores (7 advertencias preexistentes), build de 55 rutas, diff check, revisión de producto/UI/compliance y CI #74 aprobados. La producción pública redirige `/dashboard/professional` a `/login?next=%2Fdashboard%2Fprofessional` y conserva las entradas Soy usuario/Soy profesional. Estado: preparado, integrado y desplegado; recorrido público verificado. Pendiente: prueba autenticada MEMBER para guardar/recargar el borrador y prueba PROFESSIONAL para confirmar el destino de panel. No se afirma correo recibido ni E2E autenticado.

Pieza visual reciente conservada: `exec-3df552d3-fc66-4d82-9e6a-a88f52a9feb5.png`, producida el 2026-10-06 para explicar el recorrido real de EvolUSA. Lista para compartir aquí; no publicada en redes. No se generó duplicado.


## Entrega 2026-10-08 — recorrido guiado y entrada de cuenta

- **PR funcional:** [#30](https://github.com/mauricioyepesstudio/pros360era/pull/30)
- **Preparado:** `20efec5313c174b5003dcb7568c48f0ea997b971`
- **Integrado / producción:** `2c961591a1e38f6eb812023ef728462f52e0da3b`
- **Despliegue:** `dpl_AFDYaB8u4HEoZrF5cnbQBhwBS5Fe` — READY en https://evolusa.vercel.app
- **Recorrido comprobado:** el CTA «¿Cómo funciona?» abre el recorrido animado (paso 1 de 6); «Ya tengo cuenta» está debajo de las entradas principales y separa «Soy usuario» de «Soy profesional».
- **Cuenta profesional:** una cuenta MEMBER solicitante llega a su presentación privada; una cuenta PROFESSIONAL aprobada se redirige a `/panel-profesional`. Elegir esta entrada no cambia roles ni permisos.
- **Capacidades reales:** el panel profesional muestra perfil, oportunidades y CRM disponibles. Crecimiento/redes continúa marcado «En preparación»; no hay OAuth, publicación ni métricas simuladas.
- **Validación:** 99 pruebas, TypeScript, build (55 rutas), ESLint sin errores (7 advertencias preexistentes), CI #79 y revisión producto/rutas/seguridad/compliance aprobados.
- **Estado:** preparado ✅, integrado ✅, desplegado ✅, recorrido público verificado ✅; recorrido autenticado MEMBER/PROFESSIONAL pendiente de cuentas de prueba autorizadas.
- **Contenido:** se conserva la pieza EvolUSA del 2026-10-06 (`exec-3df552d3-fc66-4d82-9e6a-a88f52a9feb5.png`), lista para compartir aquí y no publicada externamente; no se generó duplicado.
- **Próximo objetivo:** probar con una cuenta MEMBER y una PROFESSIONAL que ambas entradas conservan el destino correcto y que el borrador/perfil se mantiene tras recargar.

## 2026-10-08 — identidad y destino de cuenta profesional

PR34/35 integrados previamente: ADMIN puede entrar a su panel y abrir perfil/oportunidades con el mismo guard compartido. Perfil existente guardado sin alterar campos y escritura comprobada en base viva; CRM solo listado/formulario, no seguimiento ni automatización.

Nueva corrección preparada desde main 1e8314c: el servidor resuelve la identidad autenticada sin convertir errores/fila ausente en MEMBER. Muestra el correo propio para identificar la sesión; recuperación permite reintentar o cambiar cuenta. ADMIN y PROFESSIONAL que abren /dashboard van al panel, /profile al editor profesional; entradas de MEMBER siguen sin privilegios profesionales. Login delega la decisión al servidor, elimina consulta duplicada cliente. Cuenta personal y preparación profesional se nombran explícitamente para solicitantes. Sin cambios de roles, RLS, esquema, secretos, cobros o integraciones.

Validación: 106 pruebas pasan, TypeScript aprobado, lint 0 errores/7 advertencias existentes; revisión independiente producto/security/compliance GO. Build/CI/integración/despliegue se registran en queue central tras verificarse. El navegador retenido bloqueó la nueva observación por protección de credenciales: no se afirma repetición del recorrido privado de esta corrección. Próximo objetivo: completar seguimiento CRM y conectar redes mediante autorización real, sin datos ni resultados inventados.

## 2026-10-08 — CRM: ficha y seguimiento preparados

Nueva ficha `/crm/leads/[id]` y API GET/PATCH propia: estado y notas, concurrencia por updated_at, preservación del borrador al recargar tras conflicto; guardado confirmado solo con fila devuelta. Listado enlaza a ficha y estados en español. No se envían mensajes ni se modifica consentimiento.

Migración mínima preparada para UPDATE(status,notes) de dueño PROFESSIONAL/ADMIN + trigger updated_at; rollback preserva datos. Pendiente excepción explícita a «No cambies esquema, permisos» antes de aplicar a base viva. Runbook concreto: docs/CRM-LEAD-FOLLOWUP-APPLY.md. Pruebas PGlite verifican aislamiento, rol, columnas protegidas, rechazo de versión obsoleta y rollback. Revisión independiente security/compliance GO para preparación; cambios de borrador tras conflicto preservados.

Producción cuenta: PR36 integrado825e2421564c442377e9432308cc49943d8e1f7c, deployment dpl_EDYfResNTFX1RDUzUJWB1HRKUEvr READY. Browser autenticado /dashboard redirige al panel, muestra sesión propia y Administrador · Profesional. Observación del formulario /profile bloqueada por protección de credenciales: no afirmar revalidación de ese formulario aquí.

Bloqueo redes comprobado por metadata Vercel (solo nombres, sin valores): no INSTAGRAM_APP_ID/INSTAGRAM_APP_SECRET. Growth legacy sigue apagado; autorización OAuth, storage seguro de tokens y pruebas reales faltan. No simular resultados ni habilitar pagos.


## 2026-10-08 — CRM seguimiento ACTIVADO (prevalece sobre preparación anterior)

Owner aprobó expresamente la excepción UPDATE(status,notes) tras revisar el alcance. Migración crm_lead_followup_v1 aplicada solo en EvolUSA ovialqdazxkekvqqgdiu. Metadata viva confirma status/notes permitidos, user_id/updated_at y anon denegados. Sin tablas nuevas, eliminación o mensajes.

PR37 integrado f325e8c3bf59538467742a31ae9a5f85619bcb4d; producción READY dpl_G6iszqt1aPpJEzP5dQQc6KVM8JFT. CI84 y Vercel aprobados,108 tests,TypeScript,lint0 errores7 warnings,build57 rutas. Revisor security/compliance aprobó.

Prueba real PostgreSQL con role authenticated y propietario ADMIN: INSERT temporal→UPDATE estado/notas→readback correcto→rechazo de updated_at antiguo→denegación de modificar propietario. Transacción revertida completa; ningún dato de prueba retenido. Browser autenticado abre /crm y muestra cero leads reales. No equivale a E2E formulario→guardar→recargar, aún no realizado. Protecciones del navegador limitaron observaciones de formularios; no se inventa validación.

Estado: preparado/integrado/desplegado; permisos y escritura transaccional verificados; E2E guardado por interfaz pendiente. El runbook CRM-LEAD-FOLLOWUP-APPLY.md conserva instrucciones previas de aprobación, ya resuelta por esta nota. Próximo objetivo: seguimiento con un lead real autorizado y tareas/pipeline; conversaciones y OAuth/redes continúan pendientes. Credenciales Meta ausentes en metadata Vercel; nunca habilitar handlers legacy sin flujo real seguro.


### Verificación por interfaz completada, 2026-10-08

La limitación de formulario descrita arriba se resolvió para seguimiento navegando desde el listado. Con sesión owner ADMIN: se abrió una ficha técnica explícitamente marcada «no es un cliente», se seleccionó Contactado, se guardaron notas mediante PATCH de la interfaz, apareció «Seguimiento guardado correctamente», se volvió al listado y se reabrió la ficha; estado y notas persistían. El registro técnico creado para esta prueba se retiró por ID+nombre exactos al terminar; SQL confirmó 0 registros restantes. Ningún contacto real modificado ni mensajes enviados. Es evidencia del formulario de actualización/reapertura; la creación inicial del registro fue SQL, no formulario Nuevo prospecto. Captura guardada: evolusa-crm-followup-verified-20261008.jpg. Próximo: probar captura de un lead real y desarrollar tareas/pipeline; OAuth pendiente de app Meta y autorización de plataformas.


## 2026-10-08 — solicitud inicial y agenda profesional preparadas

Desde main8444ad3, opción voluntaria de solicitar videollamada inicial al registrarse sin alterar next/handoff. Solicitud autenticada propia con nombre preferido, tema/franja enumerados, zona IANA y consentimiento revocable; guardado idempotente y cancelación. Bandeja ADMIN verificada antes de service role, sin envíos. Agenda profesional propia: disponibilidad semanal ACTIVE/PAUSED y booking_url canónico HTTPS removible. Prefijos protegidos y filtros Roadmap incluyen las versiones internas. Sin migración, permisos, secretos ni cuentas externas.

Estas son solicitudes y preferencias privadas; no reservas confirmadas ni sincronización. Integración real propuesta Cal.com APIv2 + OAuth individual + webhooks; no usar managed users antiguo ni SDK Atoms en mantenimiento como base nueva. Falta OAuth client aprobado, credenciales seguras y almacenamiento token revisado, autorización de cada profesional y pruebas con proveedor. Ver docs/EVOLUSA-INITIAL-CALL-AGENDA.md para fuentes y alcance. Pruebas/CI/deploy/browser finales registrados en cola central al completarse.


## 2026-10-09 — trayectoria profesional preparada

Secciones editables Presentación, Experiencia, Formación, Habilidades y Credenciales/cursos preparadas en el campo `professional_profiles.bio` existente, sin migración ni permisos nuevos. El formato legible v1 es versionado y reversible; conserva biografías anteriores y encabezados/backslashes literales, falla cerrado ante formatos incompletos y no recorta campos finales vacíos. Ambos editores comparten campos/parser, la vista pública solo muestra perfiles ya aprobados y omite secciones vacías, y la ficha de conexión muestra únicamente la presentación. Credenciales y experiencia se identifican como información declarada por el profesional, separada de la verificación de identidad.

Validación local: 129 pruebas, TypeScript, ESLint sin errores (7 advertencias históricas), build Next de 58 rutas y `git diff --check` aprobados; revisión independiente de producto/compatibilidad GO. Estado: preparado; PR, CI, integración, despliegue y recorrido autenticado todavía no verificados. Pieza visual `exec-5aaf0793-5264-4920-9050-981e0a0a8faa.png`, producida el 2026-10-09, lista para compartir aquí y no publicada externamente; el PNG y cualquier hoja de vida permanecen fuera del repositorio.
