"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { APP_URL, CONNECTION_FEE_CENTS, isStripeConfigured } from "@/lib/stripe/config";
import { getMyRoutedOpportunitiesForProfessional } from "@/lib/opportunities/persistence";

/**
 * Starts payment for the EVOLUSA connection fee. This is the only path
 * that can ever move an opportunity from ROUTED to CONTACTED — the free
 * mark_opportunity_contacted RPC that used to do this directly has had its
 * `authenticated` grant revoked (0015). The actual status change happens
 * server-side inside the Stripe webhook handler after payment is confirmed
 * (mark_opportunity_contacted_paid), never here and never client-side.
 *
 * Ownership is verified via get_my_routed_opportunities() — the same
 * SECURITY DEFINER RPC the professional's own dashboard reads from —
 * rather than a direct table read, since `opportunities` has no SELECT
 * policy for the professional side (only the member can read their own row
 * directly; see 0007's select_own_opportunities policy).
 */
export async function createConnectionFeeCheckout(
  opportunityId: string,
): Promise<{ url: string } | { error: string }> {
  if (!isStripeConfigured()) {
    return { error: "Los pagos todavía no están configurados. Contacta a soporte." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "El servicio no está disponible en este momento." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const myOpportunities = await getMyRoutedOpportunitiesForProfessional();
  const opportunity = myOpportunities.find((item) => item.opportunityId === opportunityId);

  if (!opportunity) return { error: "No autorizado para esta oportunidad." };
  if (opportunity.status !== "ROUTED") {
    return { error: "Esta oportunidad ya no acepta pago." };
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: CONNECTION_FEE_CENTS,
          product_data: {
            name: "Conexión confirmada en EVOLUSA",
            description: "Tarifa única por confirmar contacto con un cliente emparejado.",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${APP_URL}/panel-profesional/oportunidades?pago=exitoso`,
    cancel_url: `${APP_URL}/panel-profesional/oportunidades?pago=cancelado`,
    metadata: {
      type: "connection_fee",
      opportunity_id: opportunityId,
      professional_user_id: user.id,
    },
  });

  if (!session.url) return { error: "No se pudo crear la sesión de pago." };
  return { url: session.url };
}
