import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument, { type LegalSection } from "@/components/legal/LegalDocument";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: `Política de privacidad | ${brand.displayName}`,
  description: "Qué datos guarda EVOLUSA, para qué los usa, con quién los comparte y cómo pedir que se borren.",
};

const email = brand.contact.email;

/**
 * Privacy policy. Describes only what the code does today (Supabase Auth +
 * Postgres, Vercel, Anthropic for AI drafting, Stripe for the connection fee,
 * Instagram via lib/social). Update it in the same PR as any new data flow.
 * The operating legal entity is still pending (docs/cerebro/negocio.md).
 */
const sections: readonly LegalSection[] = [
  {
    title: "Quién es responsable",
    body: (
      <p>
        EVOLUSA es una plataforma de orientación en español para personas que avanzan en Estados Unidos y para los profesionales que las acompañan. Para cualquier tema de privacidad escríbenos a <a href={`mailto:${email}`}>{email}</a>.
      </p>
    ),
  },
  {
    title: "Qué datos guardamos",
    body: (
      <ul>
        <li>Datos de tu cuenta: correo, nombre y la contraseña cifrada que gestiona nuestro proveedor de autenticación.</li>
        <li>Lo que nos cuentas en el Journey y el Roadmap: tus respuestas, tus metas y el progreso de cada paso.</li>
        <li>Si eres profesional: tu perfil, tu trayectoria, tu agenda, tu planner de publicaciones y los contactos que registras en tu CRM.</li>
        <li>Si pagas una tarifa de conexión: el resultado del pago. Los datos de tu tarjeta los procesa Stripe y nunca llegan a EVOLUSA.</li>
        <li>Si conectas Instagram: lo que se describe en la sección siguiente.</li>
        <li>Cookies esenciales para mantener tu sesión iniciada. No usamos cookies de publicidad ni de analítica.</li>
      </ul>
    ),
  },
  {
    title: "Datos de Instagram",
    body: (
      <>
        <p>Solo los profesionales pueden conectar una cuenta de Instagram profesional (empresa o creador), y solo si lo deciden. Al conectarla guardamos:</p>
        <ul>
          <li>el identificador de la cuenta, el nombre de usuario y el tipo de cuenta;</li>
          <li>los permisos que aceptaste;</li>
          <li>la llave de acceso que entrega Instagram, cifrada. Solo la usa nuestro servidor y nunca se muestra en la plataforma.</li>
        </ul>
        <p>
          La usamos únicamente para lo que el profesional pide desde su panel: publicar las piezas que marca como listas en su planner y traer los comentarios y mensajes directos de su cuenta a su CRM (una vez al día o cuando lo pide). Ese contenido (nombre de usuario de quien escribe, texto, fecha y enlace a la publicación) se guarda en el CRM del profesional, y cada persona que escribe queda como prospecto con su nombre de usuario de Instagram. Cuando el profesional publica desde su planner, guardamos el identificador y el enlace de esa publicación para mostrárselo. No vendemos estos datos, no los usamos para publicidad y no publicamos nada que el profesional no haya aprobado.
        </p>
        <p>
          Puedes desconectar tu cuenta en cualquier momento desde tu panel (Redes) o desde Instagram, en Configuración → Apps y sitios web. Al desconectarla borramos de EVOLUSA la llave de acceso, los datos de la cuenta conectada y los comentarios y mensajes traídos. Los prospectos que ya estaban en el CRM del profesional se conservan como parte de su lista de clientes. Meta trata tus datos según su propia <a href="https://privacycenter.instagram.com/policy" target="_blank" rel="noopener noreferrer">política de privacidad</a>.
        </p>
      </>
    ),
  },
  {
    title: "Datos de LinkedIn",
    body: (
      <>
        <p>Si un profesional conecta su perfil personal de LinkedIn guardamos su identificador de LinkedIn, su nombre y la llave de acceso, cifrada. La usamos solo para publicar en su perfil lo que publica desde su planner, y guardamos el enlace de cada publicación para mostrárselo. No leemos sus contactos ni sus mensajes.</p>
        <p>LinkedIn pide volver a conectar cada 60 días. Al desconectar, o cuando la conexión vence, borramos la llave de acceso.</p>
      </>
    ),
  },
  {
    title: "Para qué los usamos",
    body: (
      <ul>
        <li>Para mostrarte tu Roadmap y tu próximo paso.</li>
        <li>Para conectarte con un profesional, solo cuando tú lo pides.</li>
        <li>Para que los profesionales administren su perfil, su agenda, su contenido y sus contactos.</li>
        <li>Para la seguridad de la plataforma y para cumplir obligaciones legales.</li>
      </ul>
    ),
  },
  {
    title: "Con quién los compartimos",
    body: (
      <>
        <p>No vendemos tus datos. Los compartimos solo con los proveedores que hacen funcionar EVOLUSA, y solo lo necesario:</p>
        <ul>
          <li>Supabase (base de datos y autenticación).</li>
          <li>Vercel (alojamiento del sitio).</li>
          <li>Anthropic (redacta borradores de texto con IA cuando un profesional usa esa función).</li>
          <li>Stripe (pagos), con su propia <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">política de privacidad</a>.</li>
          <li>Meta (Instagram), solo si un profesional conecta su cuenta.</li>
          <li>LinkedIn, solo si un profesional conecta su perfil, con su propia <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">política de privacidad</a>.</li>
        </ul>
        <p>Cuando pides una conexión con un profesional, le compartimos lo necesario para atenderte, con tu consentimiento.</p>
        <p>Los profesionales son responsables de los datos de los contactos que guardan en su CRM.</p>
      </>
    ),
  },
  {
    title: "Cuánto tiempo los guardamos",
    body: <p>Mientras tengas tu cuenta activa. Los datos de Instagram se borran al desconectar la cuenta o al quitar EVOLUSA desde Instagram; la llave de LinkedIn, al desconectar o cuando vence. Si pides borrar tu cuenta, eliminamos tus datos salvo lo que la ley nos obligue a conservar.</p>,
  },
  {
    title: "Cómo borrar tus datos",
    body: (
      <>
        <p>
          Escríbenos a <a href={`mailto:${email}`}>{email}</a> desde el correo de tu cuenta y pide que la borremos.
        </p>
        <p>
          Si conectaste Instagram y quitas EVOLUSA desde Instagram (Configuración → Apps y sitios web), borramos automáticamente los datos de esa cuenta y te damos un código para <Link href="/privacidad/eliminacion">consultar el estado de la solicitud</Link>.
        </p>
      </>
    ),
  },
  {
    title: "Cambios a esta política",
    body: <p>Si cambiamos qué datos usamos o cómo, actualizaremos esta página y la fecha de arriba.</p>,
  },
];

export default function PrivacidadPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Política de privacidad"
      updated="9 de octubre de 2026"
      intro={<p>Aquí explicamos qué datos guarda EVOLUSA, para qué y cómo puedes pedir que se borren.</p>}
      sections={sections}
    />
  );
}
