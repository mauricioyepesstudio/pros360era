# Agencia EVOLUSA — departamentos, agentes y tareas recurrentes

Pedido del dueño (2026-10-20): que el proyecto avance cada día en investigación, mejora, desarrollo, pruebas y aprobación, con un departamento por función. Esta agencia **reutiliza los agentes que ya existen** en `.claude/agents/`; solo se agregó `research-analyst` (Investigación no tenía dueño). Las reglas de `CLAUDE.md` mandan sobre este documento.

Flujo diario: **Investigación → Producto → Ingeniería → QA → Aprobación → (dueño: merge/publicar)**. Crecimiento y Operaciones corren en paralelo. Cada tarea = un PR pequeño con criterio de aceptación observable. Nada se integra, publica, cobra ni se aplica a Supabase vivo sin el OK del dueño en el chat.

| Departamento | Agentes | Responsabilidad |
|---|---|---|
| Coordinación | `orchestrator`, `estado-keeper` | Parte el trabajo, elige el siguiente PR, mantiene `ESTADO.md` al día |
| Investigación | `research-analyst` (nuevo) | Fuentes oficiales, demanda, competencia; solo lectura, con fecha y enlace |
| Producto | `evolusa-product-architect`, `ui-ux-designer` | Convierte hallazgos en tareas pequeñas con aceptación |
| Ingeniería | `frontend-engineer`, `supabase-architect`, `migration-steward` | Implementa en rama; migraciones solo con plan y revisión |
| QA y pruebas | `qa-engineer`, `security-reviewer` | Pruebas, build, RLS/grants, recorridos en navegador |
| Aprobación y cumplimiento | `compliance-reviewer`, `legal-risk-reviewer`, `growth-automation-guard` | Gate antes de pedir merge/publicar: claims, categorías reguladas, 70/30 |
| Crecimiento y contenido | `growth-marketing-strategist`, `social-content-lead`, `taste` | Reclutamiento de profesionales, adquisición de miembros y manejo de cuentas con un equipo por perfil (ver abajo) |
| Operaciones y datos | `revenue-analyst`, `revenue-analyst` | Métricas de embudo reales, costos; solo lectura de Stripe |

## Manejo de cuentas: un equipo por perfil (dueño, 2026-11-07)

El manejo profesional de cada cuenta **es el servicio que EVOLUSA ofrece**. Por eso cada perfil tiene su propio encargado de branding y su propio community manager, y nadie trabaja "en general" para todos.

| Perfil | Cuentas | Branding (`taste`) | Community manager (`social-content-lead`) |
|---|---|---|---|
| EVOLUSA | @evolusa.us, FB Evolusa (planner de hola.evolusa@gmail.com) | Brand book de EVOLUSA (`docs/EVOLUSA-BRAND-BOOK.md`) | Calendario y planner de EVOLUSA |
| Miguel Acosta / Personal CFO | @personalcfo.me, LinkedIn de Miguel | Línea gráfica de Personal CFO (kit `miguel-acosta`) | Planner de Miguel |
| Laura / 1MIGRATION | @onemigration | Línea gráfica de 1MIGRATION | Planner de Laura (categoría regulada: solo lo permitido) |
| Marie Fernandez, Florida Notary Public | @marieferve03 | Navy/dorado de su sitio (kit `marie-fernandez`) | Planner de Marie (aviso legal de F.S. 117.05 en cada pieza) |
| Real Group / Mauricio | Instagram y Facebook de Real Group Entertainment | Línea gráfica de Real Group | Planner de rgentertainmentmanagement |

Reglas:
1. Cada pieza se diseña con la línea gráfica y la voz **de ese perfil** y habla solo de su empresa y su profesión.
2. Ninguna pieza pasa de un perfil a otro, ni se "reutiliza" entre clientes.
3. **Nunca** contenido de EVOLUSA (nombre, enlaces, videos explicativos) en cuentas que no son de EVOLUSA. El código ya lo bloquea al guardar y al publicar (`lib/professional-planner/house-content.ts`, PR #112).
4. Un perfil nuevo entra a esta tabla antes de cargar su primera pieza en el planner.
5. Todo copy sigue pasando por `compliance-reviewer` y luego por `taste`.

## Tareas recurrentes por departamento

Sacadas de `ESTADO.md` (Siguiente y Bloqueado, 2026-10-20). Al cerrar una, `estado-keeper` la mueve a Hecho y trae la siguiente.

**Coordinación**
1. Cada día: leer `git log`, PRs abiertos y la cola central; elegir un solo PR del día y anotarlo en `ESTADO.md`. Aceptación: una línea fechada en Registro.
2. Mantener máximo un PR propio abierto; si hay conflicto (hoy #45, #52, #56), rebasar o cerrar con motivo antes de abrir otro.

**Investigación**
1. Semanal: 5 fuentes oficiales nuevas para `app/guias` (USCIS, IRS, Florida DBPR, SBA). Aceptación: tabla con URL, fecha de consulta y qué guía alimenta.
2. Lista de 20 profesionales de marketing/operaciones en Florida (categorías NO reguladas) para el kit de reclutamiento. Aceptación: tabla con fuente pública; sin contactar a nadie.
3. Comparativa de 3 plataformas parecidas: qué ofrecen al recién llegado y qué no. Aceptación: nota en `docs/cerebro/`.

**Producto**
1. Kit de reclutamiento de profesionales (Siguiente #1): copy de `/aplicar-profesional` alineado a `claims.ts`. Aceptación: PR revisado por `compliance-reviewer`.
2. Plan de adquisición de miembros de 4 semanas (Siguiente #3) con 1–2 guías nuevas. Aceptación: calendario + guías como PR.
3. Definir el embudo registro → diagnóstico → Roadmap → oportunidad (Siguiente #4). Aceptación: eventos nombrados en `lib/opportunities/analytics.ts`.

**Ingeniería**
1. Un cambio pequeño por día desde la tarea de Producto, con pruebas nuevas.
2. Actualizar README, `ci.yml` y `docs/CURRENT-STATE.md` (Siguiente #5).
3. `migration-steward`: resolver la numeración duplicada 0015/0017 en un plan escrito (sin aplicar).

**QA y pruebas**
1. Cada PR: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`; adjuntar resultado al PR.
2. Recorridos en navegador 375/768/1280 de home, onboarding, `/aplicar-profesional`.
3. Recorridos autenticados MEMBER y PROFESSIONAL. **Desde 2026-10-20 las cuentas de prueba existen** y están guardadas como secretos de GitHub Actions `E2E_MEMBER_EMAIL`, `E2E_MEMBER_PASSWORD`, `E2E_PRO_EMAIL`, `E2E_PRO_PASSWORD`. Tarea prioritaria: workflow `.github/workflows/acceptance.yml` **solo manual** (`workflow_dispatch`) que, con Playwright contra producción, inicia sesión con cada cuenta y recorre las 11 tareas bloqueadas (navegación por rol, perfil y enlaces, reserva, planner, CRM), con datos marcados `[E2E]` y borrados al final cuando la app lo permita. Nunca imprimir los secretos. Si la cuenta PRO no tiene rol PROFESSIONAL, reportarlo como bloqueo para el dueño; no cambiar roles.
   - **Decisión del dueño (2026-10-20):** la cuenta PRO es su **perfil profesional real** (ya tiene rol PROFESSIONAL). Las pruebas pueden leer y navegar con ella, pero **no editan ni borran sus datos reales** (perfil, enlaces, reservas, planner existentes): solo crean y luego eliminan registros propios marcados `[E2E]`. Para comprobar guardado/recarga de perfil, editar un campo y restaurar exactamente el valor original en la misma prueba.

**Aprobación y cumplimiento**
1. Antes de pedir merge: `compliance-reviewer` (claims y categorías), `security-reviewer` si toca auth/datos. Aceptación: "GO" escrito en el PR.
2. `growth-automation-guard`: revisar que nada de Growth Automation / 70/30 / Laura-1MIGRATION active categorías reguladas.

**Crecimiento y contenido**
1. Planner del dueño: una pieza nueva por día, lista pero no publicada sin autorización por canal.
2. Mensaje de invitación a profesionales (NO regulados) listo para que el dueño lo envíe.

**Operaciones y datos**
1. Semanal: métricas reales del embudo (usuarios, profesionales, solicitudes) en `ESTADO.md`; `null` = no medido.
2. Mensual: costos de Vercel/Supabase/Resend/Anthropic visibles para el dueño.

## Lo que solo el dueño puede desbloquear
- Cuentas de prueba MEMBER y PROFESSIONAL (y su acceso) para las pruebas autenticadas; hoy bloquean 11 tareas de la cola central.
- Dominio remitente verificado en Resend (el registro falla con SMTP 550 en modo pruebas).
- Merge de PRs, Stripe Live (en pausa hasta definir la entidad legal) y migraciones al Supabase vivo.
- Laura / 1MIGRATION: inmigración es categoría **regulada**. Su perfil público y cualquier conexión del reparto 70/30 siguen bloqueados hasta que el dueño lo confirme con un asesor (`docs/cerebro/decisiones.md`). Mientras tanto solo se permite enlazar a páginas públicas existentes (p. ej. `/profesionales`), sin presentarla como profesional verificada.
