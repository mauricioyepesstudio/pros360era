/**
 * EVOLUSA's first self-serve product: a paid-eventually, free-for-now
 * interactive plan the user completes entirely on their own — no
 * professional, no referral, no operator involvement. Deliberately built as
 * a standalone data model (not folded into lib/account/roadmap-engine.ts's
 * shared catalog) so its steps never compete for the roadmap board's
 * now/upcoming slot caps and so tests/account-roadmap.test.ts's existing
 * assertions about that engine stay untouched.
 *
 * Completion reuses the exact same live mechanism as the general Roadmap
 * (app/(account)/actions.ts's completeRoadmapItemAction ->
 * lib/account/persistence.ts's completeRoadmapItem -> the `roadmap_items`
 * table's catalog_item_id column, which accepts any string — no schema
 * change needed). Step ids are namespaced `credit-plan:*` so they can never
 * collide with lib/account/roadmap-engine.ts's own catalog ids.
 *
 * Content basis: expands the single "credit-building" roadmap-engine line
 * item into the real sequence a newcomer without US credit history follows,
 * entirely non-regulated (no license required to explain any of this) —
 * matches data/compliance/claims.ts's EDUCATION/BUSINESS_OPERATIONS tier,
 * never a "we will build your credit for you" claim.
 */

export type CreditPlanStep = {
  id: string;
  title: string;
  description: string;
  /** Why this order — shown so the plan reads as a real sequence, not an arbitrary checklist. */
  why: string;
};

export const creditPlanSteps: readonly CreditPlanStep[] = [
  {
    id: "credit-plan:bank-account",
    title: "Abre una cuenta bancaria",
    description: "Elige un banco o cooperativa de crédito (credit union) que acepte tu identificación (pasaporte, ITIN si aplica). Muchos bancos comunitarios en Florida no piden Seguro Social.",
    why: "Una cuenta bancaria es el requisito de casi todos los siguientes pasos, y es el primer historial financiero verificable en Estados Unidos.",
  },
  {
    id: "credit-plan:secured-card",
    title: "Solicita una tarjeta con depósito de garantía (secured card)",
    description: "Es una tarjeta de crédito real donde tú pones un depósito (ej. $200) como límite. Se reporta a las tres agencias de crédito igual que cualquier tarjeta normal.",
    why: "Es la forma más accesible de empezar un historial de crédito sin necesitar historial previo — el depósito elimina el riesgo para el banco.",
  },
  {
    id: "credit-plan:small-recurring-charge",
    title: "Pon un cargo pequeño y recurrente en la tarjeta",
    description: "Una suscripción o gasto fijo mensual (ej. streaming, gasolina) — nunca más de lo que puedes pagar de contado ese mes.",
    why: "El uso constante y bajo (menos del 30% del límite) es lo que las agencias de crédito premian, no el monto gastado.",
  },
  {
    id: "credit-plan:autopay",
    title: "Configura el pago automático completo cada mes",
    description: "Programa el pago automático del saldo total, no el mínimo — así nunca hay riesgo de un pago tarde ni de pagar intereses.",
    why: "El historial de pagos a tiempo es, por sí solo, el factor más grande en tu puntaje de crédito.",
  },
  {
    id: "credit-plan:check-report",
    title: "Revisa tu reporte de crédito gratis",
    description: "En annualcreditreport.com puedes ver tu reporte de las tres agencias gratis. Revisa que no haya errores ni cuentas que no reconozcas.",
    why: "Confirma que el sistema realmente está registrando tu historial, y detecta errores o fraude a tiempo.",
  },
  {
    id: "credit-plan:graduate",
    title: "Después de 6-12 meses, pide graduar o abrir una segunda cuenta",
    description: "Con historial puntual, pide que tu tarjeta con depósito se convierta en una sin depósito (te devuelven el dinero), o solicita una segunda tarjeta sin depósito.",
    why: "Un historial más largo y más de una cuenta activa suelen mejorar el puntaje más rápido que una sola tarjeta indefinidamente.",
  },
] as const;

export function getCreditPlanStep(id: string) {
  return creditPlanSteps.find((step) => step.id === id);
}
