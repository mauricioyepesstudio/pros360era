export const brand = {
  name: "EVOLUSA",
  displayName: "EVOLUSA",
  legalName: "Por confirmar",

  wordmarkParts: {
    evol: "EVOL",
    usa: "USA",
  },

  tagline: "Tu próximo paso.",
  primaryPositioning: "Tu camino para avanzar en Estados Unidos.",
  secondaryPositioning:
    "Orientación, servicios y profesionales para ayudarte a avanzar con confianza.",

  description:
    "EVOLUSA te ayuda a identificar tu próximo paso para establecerte, emprender y crecer en Estados Unidos.",

  phone: {
    display: "+1 (786) 604-1733",
    href: "tel:+17866041733",
  },
  whatsapp: {
    number: "+17866041733",
    href: "https://wa.me/17866041733",
  },
  email: null,
  website: null,
  address: null,
  businessHours: "Lunes a viernes, 9am-6pm",

  // Compatibilidad temporal con los componentes existentes hasta integrar el nuevo Home.
  contact: {
    phoneDisplay: "+1 (786) 604-1733",
    phoneHref: "tel:+17866041733",
    whatsappNumber: "+17866041733",
    whatsappLink: "https://wa.me/17866041733",
    email: "Por confirmar",
  },

  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
  },

  // Reference only — the live CSS custom properties in app/globals.css
  // (--evolusa-navy, --evolusa-red, --brand-blue, etc.) are the source of
  // truth actually used by components. Kept here in sync for anyone
  // reading brand.ts directly instead of the stylesheet.
  colors: {
    navy: "#061B3A",
    red: "#F20D24",
    blue: "#2563EB",
    warmCanvas: "#FAFAF8",
    skySurface: "#EFF6FF",
    growthGreen: "#2E8B57",
    textDark: "#061B3A",
    muted: "#64748B",
  },

  cta: {
    primary: "Descubre tu próximo paso",
    secondary: "Habla con nosotros",
    whatsapp: "Continuar por WhatsApp",
    whatsappShort: "WhatsApp",
  },

  locale: {
    default: "es-US",
    supported: ["es-US", "en-US"],
  },
} as const;

export type Brand = typeof brand;
