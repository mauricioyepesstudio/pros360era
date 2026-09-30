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

## Abiertas / a confirmar
- ¿Growth Automation con reparto 70/30 es compatible con las reglas de fee en categorías reguladas? (`docs/GROWTH-AUTOMATION.md` lo declara; `EVOLUSA-PROFESSIONAL-NETWORK.md` prohíbe comisión por lead en REGULATED.) Sin decidir.
- Numeración de migraciones duplicada (0015, 0017).
- Destino de las demos Laura/1MIGRATION.

## Pendiente de completar
- Fecha y razón de elegir Next 16 / Supabase / Stripe (no documentadas).
- Política de precios de profesionales (suscripción) más allá del fee de $25.
- Criterios de salida de Sandbox → Live.
