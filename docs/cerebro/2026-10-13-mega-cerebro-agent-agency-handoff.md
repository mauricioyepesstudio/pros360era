# Handoff al Mega Cerebro — EvolUSA / agencias de agentes
Fecha: 2026-10-13
Estado: PROPUESTA DE TRABAJO EN RAMA, NO DESPLEGADA
Repo: mauricioyepesstudio/pros360era
Rama: fix/planner-plantilla-suggestions-20261013
PR: #52

## Fuentes y autoridad
- Fuente primaria: código + git log + CI, después ESTADO.md y docs/CURRENT-STATE.md.
- Segundo cerebro local: CLAUDE.md, ESTADO.md, docs/cerebro/, .claude/agents/ y .claude/skills/.
- Mega Cerebro / AI-Projects-Control-Plane coordina colas entre proyectos; NO importar datos privados ni tokens a su memoria.
- Mantener aislamiento de EvolUSA, BELONG, Resource Living, Personal CFO, Portfolio y Park Place Owner.
- No asumir que los agentes de desarrollo (.claude/agents) ya son agentes de negocio ejecutándose en producción.

## Objetivo operativo
Un Professional Command Center por cuenta: marca + perfil profesional + CRM + planner/schedule + conexiones + campañas + analítica, orquestados por capacidades de IA. Miguel y Laura ya realizan pruebas: priorizar sus solicitudes existentes, sin sobrescribir sus publicaciones, imágenes ni conexiones. Mi Evolución es el acompañamiento del miembro, distinto del panel profesional.

## Inventario: IMPLEMENTADO EN REPO, estado de despliegue por verificar
| Capacidad | Evidencia | Acción siguiente |
|---|---|---|
| Perfil profesional | lib/professional/self-profile.ts | Probar lectura/escritura y permisos con cada usuario |
| CRM | app/(account)/crm/page.tsx y migraciones | Verificar esquema aplicado y aislamiento de datos |
| Planner | components/professional/PublicationPlanner.tsx | Probar guardado y conservación de posts existentes |
| Conexiones sociales | lib/social/connections.ts | Confirmar scopes/estado de cada proveedor sin extraer tokens |
| Publicador | lib/professional-planner/publisher.ts | Probar confirmación externa, idempotencia, cron y fallos |
| IA editorial | lib/growth-automation/content-generator.ts + planner/ai-actions.ts en PR #52 | Validar modelo, costes, límites, formato y revisión humana |
| Journey miembro | docs/producto/evolusa-marketing-autonomo.md | Diseñar MVP con permisos por engagement, no inventar estatus oficial |

## Contrato de tarea para Mega Cerebro
Cada unidad de trabajo debe registrar:
- project_id = evolusa; owner = segundo-cerebro-evolusa
- task_id, solicitud_origen, profesional afectado (seudónimo, nunca email o datos privados)
- capability, estado: DISCOVERED | TRIAGED | IN_PROGRESS | BLOCKED | IN_REVIEW | VERIFIED
- evidencia (archivo, commit, PR, prueba), prioridad, responsable, dependencias, siguiente acción
- risk_class = LOW | PRIVACY | REGULATED | PUBLISH | BILLING | DEPLOY
- requires_owner_approval, approval_evidence, rollback_plan, validation_status
- sin secretos, tokens, contenido de clientes ni datos migratorios/financieros personales.

## Cola priorizada (sin duplicar trabajos abiertos)
1. EVOLUSA-AGENCY-001: auditoría de brechas entre perfiles, CRM, planner, conexiones y publisher. Solo lectura. Entregable: matriz de funcionalidad vs prueba real por cuenta (sin datos privados).
2. EVOLUSA-AGENCY-002: validar PR #52: lint, TypeScript, tests, build, controles de coste y error de IA; corregir fallos en la misma rama, sin merge.
3. EVOLUSA-AGENCY-003: diseñar orquestador de tareas profesional usando módulos existentes, consentimiento y aprobaciones. No habilitar acciones externas sin gate.
4. EVOLUSA-JOURNEY-001: especificar flujo Mi Evolución con permisos granulares, hitos, citas y notificaciones verificadas, sin acceso cruzado.
5. EVOLUSA-PILOT-001: pruebas guiadas de Miguel y Laura en sus propias cuentas, con aprobación explícita para cualquier publicación externa.

## Skills operativos sugeridos (NO afirmar instalados)
- lead-intake-and-qualification: registra origen y consentimiento, no aconseja sobre estatus migratorio.
- brand-safe-content: redacta propuestas basadas en perfil y claims verificables; requiere aprobación humana.
- publishing-guard: comprueba permisos, versión aprobada, fecha, idempotencia y resultado externo.
- followup-scheduler: recordatorios y citas, opt-in, deduplicación, sin plazos legales inferidos.
- journey-progress: hitos confirmados por el profesional, acceso granular y auditoría.
- growth-insights: resultados agregados por profesional, sin exponer datos de terceros.

## Puertas de seguridad
- No merge a main, deploy, migraciones vivas, envío, publicación, gastos ni pagos sin aprobación explícita del owner.
- Para cambios en auth/RLS/datos, revisión security-reviewer; claims y servicios regulados, compliance-reviewer.
- Para IA: autenticación, autorización, rate limit, presupuesto, sanitización de entrada, observabilidad sin PII y fallback honesto.
- Para usuarios: no compartir datos entre profesionales por defecto, no alterar ranking por pagos, no prometer resultados.
- El piloto sigue gratuito. No activar Stripe Live ni modelos de referidos regulados.

## Criterios de aceptación de la próxima iteración
- Mapa de rutas y permisos por rol, respaldado por código.
- Estado real de migraciones/conexiones/cron comprobado en el entorno autorizado.
- Suite CI verde en rama y revisión de seguridad/compliance.
- Un flujo de lead→CRM→tarea/cita y otro de idea→aprobación→publicación verificable; si faltan permisos, marcar BLOQUEADO, nunca simular éxito.
- Handoff del segundo cerebro al Mega Cerebro con enlaces a PR/commits y tareas; no duplicar colas ni activar automatizaciones no autorizadas.
