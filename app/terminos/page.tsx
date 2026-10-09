import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument, { type LegalSection } from "@/components/legal/LegalDocument";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: `Términos de uso | ${brand.displayName}`,
  description: "Las reglas para usar EVOLUSA como miembro o como profesional.",
};

const email = brand.contact.email;

/**
 * Terms of use. Mirrors the boundaries in data/compliance/claims.ts and
 * docs/EVOLUSA-TRUST-COMPLIANCE.md: EVOLUSA orients and connects; it is not
 * a law firm, immigration agency, CPA, insurer or financial entity, and it
 * promises no results.
 */
const sections: readonly LegalSection[] = [
  {
    title: "Qué es EVOLUSA",
    body: (
      <p>
        EVOLUSA es una plataforma de orientación en español. Te ayuda a identificar tu próximo paso en Estados Unidos y, si lo pides, te conecta con profesionales independientes. EVOLUSA no es un bufete de abogados, una agencia de inmigración, un contador público, una aseguradora ni una entidad financiera, y no da asesoría legal, migratoria, tributaria ni financiera.
      </p>
    ),
  },
  {
    title: "Sin resultados garantizados",
    body: <p>La orientación de EVOLUSA es general. No prometemos resultados, aprobaciones, ingresos ni clientes. Cada decisión es tuya o del profesional que elijas.</p>,
  },
  {
    title: "Tu cuenta",
    body: <p>Usa datos reales y cuida tu contraseña. Eres responsable de lo que se haga desde tu cuenta. Podemos suspender cuentas que se usen para engañar, dañar a otras personas o violar la ley.</p>,
  },
  {
    title: "Profesionales",
    body: (
      <>
        <p>
          Los profesionales son independientes de EVOLUSA y responden por sus propios servicios, licencias y cumplimiento. EVOLUSA no es parte del acuerdo entre tú y el profesional que elijas. &ldquo;Perfil aprobado&rdquo; significa que revisamos su perfil en la plataforma; no es una verificación de identidad ni de licencias. Ningún pago cambia el orden ni la elegibilidad de un profesional.
        </p>
        <p>
          Si conectas una red social, autorizas a EVOLUSA a usarla solo para lo que pides desde tu panel, como publicar lo que marcas como listo en tu planner. Eres responsable del contenido que apruebas y de cumplir las reglas de cada red; el uso de Instagram también se rige por los términos de Meta. Puedes desconectarla cuando quieras. Podemos suspender un perfil profesional que incumpla estos términos o las reglas de la plataforma.
        </p>
      </>
    ),
  },
  {
    title: "Pagos",
    body: <p>Cuando hay una tarifa, se muestra antes de pagar y la procesa Stripe. Si tienes un problema con un cobro, escríbenos.</p>,
  },
  {
    title: "Privacidad",
    body: (
      <p>
        Cómo usamos tus datos está en la <Link href="/privacidad">política de privacidad</Link>.
      </p>
    ),
  },
  {
    title: "Cambios y contacto",
    body: (
      <p>
        Podemos actualizar estos términos; la fecha de arriba indica la última versión. Para cualquier duda escribe a <a href={`mailto:${email}`}>{email}</a>.
      </p>
    ),
  },
];

export default function TerminosPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Términos de uso"
      updated="9 de octubre de 2026"
      intro={<p>Estas son las reglas para usar EVOLUSA, como miembro o como profesional.</p>}
      sections={sections}
    />
  );
}
