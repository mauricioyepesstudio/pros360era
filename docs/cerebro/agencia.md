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
| Crecimiento y contenido | `growth-marketing-strategist`, `marketing-strategist`, `social-content-lead`, `social-media-manager`, `brand-taste-lead`, `taste` | Reclutamiento de profesionales, adquisición de miembros, planner del dueño |
| Operaciones y datos | `finance-analyst`, `revenue-analyst` | Métricas de embudo reales, costos; solo lectura de Stripe |

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
