# Decisiones

Registro de decisiones con evidencia. Formato: fecha · decisión · por qué · fuente.

## Tomadas
- **Producto = plataforma guiada, no directorio** ("Journey" de 6 etapas + Roadmap). `docs/EVOLUSA-POSITIONING.md`, `EVOLUSA-PRODUCT-ARCHITECTURE.md`.
- **Español primero** (es-US), inglés soportado. `config/brand.ts`.
- **Claims y categorías reguladas centralizados** en `data/compliance/claims.ts`; las reguladas nacen deshabilitadas/referral. Agentes `compliance-reviewer`, skill `evolusa-compliance`.
- **"La confianza no se vende"**: pagos no influyen en ranking/elegibilidad/verificación. `EVOLUSA-PROFESSIONAL-NETWORK.md`, `EVOLUSA-REGULATORY-POLICY.md`.
- **Aprobado ≠ verificado**: tablas separadas (`professional_profiles.is_approved` vs `professional_verifications`). Migración 0006.
- **Lanzamiento estrecho**: solo Florida; categorías `BUSINESS_MARKETING`, `BUSINESS_OPERATIONS`, `NOTARY` (0011, 0013).
- **Excepción aprobada por el owner**: `get_my_routed_opportunities()` lee `auth.users.email` para entregar contacto con consentimiento. `EVOLUSA-SECURITY.md`.
- **Tarifa de conexión de $25** vía Stripe (Sandbox verificado; Live pendiente). `lib/stripe/`, commit 2026-09-03.
- **Reconciliación de ramas (2026-09-24)**: `feat/evolusa-migration` fusionada en `main`; `main` es la línea canónica hoy.
- **CI en Node 24** para igualar Vercel.

## PENDIENTE — decisión del dueño
- **Entidad legal que cobra**: PENDIENTE — decisión del dueño. Candidatos citados en docs: "Real Group Entertainment LLC" (copy público) y "Auto Flow Systems" (cuenta Stripe). **Stripe no pasa a Live hasta definirla** (2026-09-30).
- **Growth Automation (reparto 70/30) y demos Laura/1MIGRATION**: PENDIENTE — sin decidir; el dueño lo confirmará con un asesor. **Regla provisional (2026-09-30): limitado a categorías NO reguladas** (hoy marketing y operaciones de negocio). Ningún profesional de inmigración, legal, tax, seguros, notario, etc. entra al reparto ni a la automatización hasta confirmación. Conflicto de fondo: `EVOLUSA-PROFESSIONAL-NETWORK.md` prohíbe fee por lead/comisión en REGULATED.
- **Prioridad de las próximas semanas (decidido)**: reclutar profesionales y crecer miembros; Stripe Live no es prioridad.

## Abiertas
- Numeración de migraciones duplicada (0015, 0017): plan propuesto en `ESTADO.md`, sin ejecutar.
- Estado real de Supabase vivo (0 profesionales pese a los docs): confirmar con el dueño si hubo reset.

## Pendiente de completar
- Fecha y razón de elegir Next 16 / Supabase / Stripe (no documentadas).
- Política de precios de profesionales (suscripción) más allá del fee de $25.
- Criterios de salida de Sandbox → Live (tras definir entidad).
