# ESTADO — EVOLUSA

_Actualizado: 2026-09-30 (desde `git log` en `main` = `c4b3cfa`). Mantener con el agente `estado-keeper`._

## Objetivo actual
Llevar EVOLUSA a un lanzamiento real y seguro: **cobrar la tarifa de conexión de $25 en modo live**, reconciliar el estado de migraciones y activar el crecimiento de profesionales y miembros sin romper las reglas de cumplimiento. _(Inferido de handoff 2026-09-04, `docs/EVOLUSA-LAUNCH-CHECKLIST.md` y commits recientes; confirmar con el owner.)_

## Siguiente (máx. 5; una tarea = un PR)
1. **Auditar migraciones**: resolver numeración duplicada (`0015_*` ×2, `0017_*` ×2) y documentar cuáles están aplicadas al Supabase vivo (docs dicen vivo hasta 0012–0013). `migration-steward`.
2. **Revisión de cumplimiento del módulo Growth Automation**: el reparto 70/30 de ingresos y la automatización de respuestas/WhatsApp para profesionales (inmigración, etc.) frente a `regulatory-policy.ts` y "sin fee-splitting en categorías reguladas". `growth-automation-guard` + `legal-risk-reviewer`. Solo informe/ajuste de docs/copy.
3. **Actualizar `docs/CURRENT-STATE.md`**: está desfasado (aún habla de `feat/evolusa-migration` y divergencia con `main`, ya reconciliada el 2026-09-24).
4. **Limpiar demos de Laura/1MIGRATION** (`app/professional-*`, `LAURA_*`, `AUDIT_AND_PROPOSAL.md` en la raíz): decidir si se mantienen como demos privadas o se mueven a `docs/`; revisar que no expongan datos ni claims.
5. **Reemplazar README** (sigue siendo el de create-next-app) por uno real breve y corregir `ci.yml` (todavía apunta a `feat/evolusa-migration`).

## En curso / Bloqueado
- **Bloqueado (owner)**: paso de Stripe Sandbox → Live (revelar `sk_live_…` y crear webhook live; pegar solo en Vercel). Fuente: `.claude/handoff-2026-09-04.md`.
- **Bloqueado (owner)**: confirmar entidad legal (`config/brand.ts`, ver `docs/cerebro/negocio.md`).
- **Pendiente**: fotos reales (owner y Daniela Torres con su autorización); Marie Fernández (notaria) debe registrarse antes de su verificación.
- **Pendiente**: vectores de logo reales (los PNG son provisionales).

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
- 2026-09-30: creado el segundo cerebro (`CLAUDE.md`, `ESTADO.md`, `docs/cerebro/`, 3 subagentes) en la rama `cerebro`. Sin cambios de código de la app.
