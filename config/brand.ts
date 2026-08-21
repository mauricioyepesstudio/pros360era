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
    display: "Por confirmar",
    href: "#contact",
  },
  whatsapp: {
    number: null,
    href: "#contact",
  },
  email: null,
  website: null,
  address: null,
  businessHours: null,

  // Compatibilidad temporal con los componentes existentes hasta integrar el nuevo Home.
  contact: {
    phoneDisplay: "Por confirmar",
    phoneHref: "#contact",
    whatsappNumber: null,
    whatsappLink: "#contact",
    email: "Por confirmar",
  },

  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
  },

  colors: {
    navy: "#102A43",
    blue: "#1677FF",
    coral: "#F05A47",
    gold: "#F5B942",
    warmCanvas: "#F7F5F0",
    skySurface: "#EAF4FF",
    growthGreen: "#2E9B6F",
    textDark: "#102A43",
    muted: "#627D98",
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
