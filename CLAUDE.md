@AGENTS.md

# EVOLUSA (repo `pros360era`) — segundo cerebro

> Antes de trabajar: lee `ESTADO.md` (qué sigue) y, para decisiones, marca y negocio, `docs/cerebro/`. Ante contradicción manda `git log` y el código; luego `docs/CURRENT-STATE.md`.

## Qué es
Plataforma "Spanish-first" de progreso para hispanohablantes en EE. UU.: un **Journey de 6 etapas + Roadmap** personalizado que lleva a la persona a su "próximo paso" y la conecta con recursos, servicios permitidos o **profesionales verificados**. No es un directorio genérico de "multiservicios" (ver `docs/EVOLUSA-POSITIONING.md`). Lema: "Tu próximo paso."

## Para quién
- **Miembros**: recién llegados, emprendedores, dueños de negocio, jefes de familia (español primero, inglés soportado).
- **Profesionales**: verificados, reciben oportunidades cualificadas (hoy `BUSINESS_MARKETING`, `BUSINESS_OPERATIONS`, `NOTARY`; solo Florida).
- **Operador/Admin**: Mauricio (owner). Contacto/entidad operativa: ver `docs/cerebro/negocio.md` (entidad legal sin confirmar).

## Stack
Next.js 16.3 (App Router, **no es el Next que conoces**: lee `node_modules/next/dist/docs/`), React 19, TypeScript, Tailwind 4, Radix, framer-motion, react-hook-form + zod. Supabase (Auth + Postgres + RLS, migraciones en `supabase/migrations/`), Stripe (tarifa de conexión $25), `@anthropic-ai/sdk` (asistente EvolUSAia). Despliegue Vercel (proyecto `evolusa`). Puerto dev **3002**. CI (`.github/workflows/ci.yml`): lint, `tsc --noEmit`, test, build con Node 24.

Comandos: `npm run dev | lint | test | build`, `npx tsc --noEmit`.

## Reglas (obligatorias)
1. **Fuente de verdad de claims**: `data/compliance/claims.ts` (+ `regulatory-policy.ts`). Todo copy, testimonio, cifra o servicio pasa por `compliance-reviewer` antes de publicarse. EVOLUSA no es bufete, agencia de inmigración, CPA, aseguradora ni entidad financiera; nunca promete resultados.
2. **Categorías reguladas** (LEGAL, IMMIGRATION, TAX, INSURANCE, NOTARY, BOOKKEEPING, BUSINESS_FORMATION): por defecto deshabilitadas/referral; activarlas o cobrar por lead/cita en ellas requiere visto bueno explícito del owner.
3. **"La confianza no se vende"**: ningún pago altera ranking, elegibilidad ni `identity_verified`. "Perfil aprobado" ≠ "identidad verificada".
4. **Jerarquía de fuentes visible al usuario**: `OFFICIAL` > `EVOLUSA_GUIDE` > `PROFESSIONAL`.
5. **Supabase**: RLS en toda tabla de usuario; `REVOKE ... FROM PUBLIC` no quita grants directos a `anon`/`authenticated` (bug real ya ocurrido 2 veces; revisa grants). Skills: `postgres-rls`, `supabase-auth`.
6. **Git**: skill `git-safe-workflow`. Nada de push forzado, `reset --hard`, ni merge a `main` sin aprobación en el chat.
7. Cambios de producto/IA/rutas → `evolusa-product-architect` y skill `evolusa-product`.
8. Español primero en toda copia de cara al usuario; tokens de marca solo desde `app/globals.css` (`docs/EVOLUSA-BRAND-BOOK.md`).

## No se toca (sin orden explícita del owner)
- `.env*`, credenciales Supabase/Vercel/Stripe, remotes de git. Claves (`sk_live_…`) nunca en el chat: el owner las pega directo en Vercel.
- El paso de Stripe **Sandbox → Live** y cualquier webhook live.
- Migraciones: no aplicar a Supabase vivo sin `security-reviewer` + OK del owner. Ojo a la numeración duplicada (0015 y 0017 tienen dos archivos cada una).
- Activar categorías reguladas, modelos de fee en ellas, o claims `REQUIRES_VERIFICATION`.
- `public/brand/*` (rasters temporales; se reemplazan 1:1 por vectores reales, no re-trazar).
- Otros repos (BELONG, mauricio-portfolio, etc.).

## Equipo (subagentes en `.claude/agents/`)
Producto/ingeniería: `orchestrator` (primero en tareas ambiguas), `evolusa-product-architect`, `frontend-engineer`, `supabase-architect`, `security-reviewer`, `qa-engineer`, `ui-ux-designer`.
Cumplimiento/negocio: `compliance-reviewer` (última revisión), `legal-risk-reviewer`, `finance-analyst`, `revenue-analyst` (solo lectura; nunca toca Stripe).
Marketing (nunca tocan código de app ni `claims.ts`): `growth-marketing-strategist`, `marketing-strategist`, `social-content-lead`, `social-media-manager`, `brand-taste-lead`, `taste`.
Nuevos del cerebro: `migration-steward` (numeración/estado de migraciones), `estado-keeper` (mantiene ESTADO.md vs git log), `growth-automation-guard` (revisa el módulo Growth Automation/CRM contra las reglas de cumplimiento).

Todo claim, testimonio o estadística de marketing → `compliance-reviewer` antes de salir.

## Skills del repo
`evolusa-compliance`, `evolusa-product`, `git-safe-workflow`, `postgres-rls`, `supabase-auth` (en `.claude/skills/`).

## Capacidades (conectores, skills, agentes)
Justificadas por código/docs:
| Capacidad | Por qué |
|---|---|
| **GitHub** (MCP) | repo `mauricioyepesstudio/pros360era`, PRs y CI |
| **Supabase** | proyecto vivo `ovialqdazxkekvqqgdiu`; migraciones, advisors, logs |
| **Vercel** | proyecto `evolusa`, dominio evolusa.vercel.app; deploys/logs |
| **Stripe vía Windsor.ai** (solo lectura) | analítica de ingresos; handoff 2026-09-04 |
| **Slack** (workspace MYLabs.inc) | configurado en el handoff 2026-09-04 |
| Skills `evolusa-*`, `postgres-rls`, `supabase-auth`, `git-safe-workflow` | existen en el repo |
| Agentes arriba | existen en `.claude/agents/` |

Propuesta (dudoso, confirmar con el owner):
- **Meta Ads / Windsor.ai (Facebook/Instagram)**: el módulo Growth Automation publica en Instagram/TikTok/YouTube; útil para métricas orgánicas, pero no hay evidencia de campañas pagas.
- **Make**, **HubSpot**: hay CRM propio (`app/api/crm`, migraciones 0017–0019); solo si se quiere automatizar/sincronizar fuera de Supabase.
- **Firecrawl**: investigación de normativa oficial (fuentes `OFFICIAL`) y guías (`app/guias`).
- **Higgsfield / Kling / HyperFrames / Descript**: video para redes (`docs/marketing/`); no hay código que los use.
- **Ruflo (claude-flow) MCP**: mencionado en el handoff, solo en la máquina de oficina.
- Probablemente **no aplican**: Indeed, HypeAuditor, Ad_Superpowers (sin base en docs).
