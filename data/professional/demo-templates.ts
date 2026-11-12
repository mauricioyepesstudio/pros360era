/**
 * Isolated product demonstrations, NOT people, businesses, licensed professionals, listings or live agents.
 * Never insert these in professional_profiles / matching / CRM / public directory.
 */
export type DemoModule = { title: string; description: string; cta: string };
export type DemoTask = { title: string; trigger: string; result: string; approval: string };
export type DemoProfile = {
  slug: string; category: string; title: string; tagline: string;
  audience: string; accent: string; icon: "house" | "file" | "stamp" | "chart" | "megaphone" | "calculator" | "shield" | "hammer";
  modules: readonly DemoModule[]; tasks: readonly DemoTask[];
};
export const demoProfiles: readonly DemoProfile[] = [
  {
    slug:"realtor", category:"Real Estate", title:"Real Estate Studio", tagline:"Explora propiedades, agenda visitas y encuentra tu próximo hogar.",
    audience:"Compradores, vendedores e inversionistas", accent:"from-indigo-900 via-blue-800 to-sky-600", icon:"house",
    modules:[
      {title:"Propiedades destacadas",description:"Galería, precio, características y disponibilidad, cuando se conecte un catálogo real.",cta:"Ver propiedad"},
      {title:"Agenda de visitas",description:"Solicitudes de visita y confirmaciones sujetas al calendario del agente.",cta:"Solicitar visita"},
      {title:"Valoración de vivienda",description:"Formulario para entender ubicación, tipo de inmueble y objetivo de venta.",cta:"Solicitar evaluación"}
    ],
    tasks:[
      {title:"Importar inventario",trigger:"Nueva ficha aprobada desde fuente autorizada",result:"Ficha actualizada con estado y fotos",approval:"Verificar MLS, licencias y permiso de publicación"},
      {title:"Calificar compradores",trigger:"Solicitud de visita",result:"Lead con presupuesto, zona, fecha y siguiente acción",approval:"Consentimiento de contacto antes de compartir"},
      {title:"Seguimiento",trigger:"Visita completada",result:"Recordatorio de seguimiento en ARM",approval:"No enviar mensajes sin autorización"}
    ]
  },
  {
    slug:"inmigracion-documental",category:"Preparación documental",title:"Document Support Studio",tagline:"Organiza tus documentos y conoce las opciones de apoyo administrativo.",
    audience:"Personas que necesitan organizar formularios",accent:"from-blue-950 via-blue-800 to-cyan-600",icon:"file",
    modules:[
      {title:"Preparación de formularios",description:"Apoyo documental bajo instrucciones de la persona solicitante.",cta:"Consultar requisitos"},
      {title:"Checklist de documentos",description:"Lista orientativa y control de archivos pendientes.",cta:"Ver checklist"},
      {title:"Recursos educativos",description:"Artículos y guías informativas sin asesoría legal.",cta:"Explorar recursos"}
    ],
    tasks:[
      {title:"Organizar solicitud",trigger:"Formulario de interés autorizado",result:"Caso administrativo con checklist",approval:"No determinar elegibilidad legal"},
      {title:"Solicitar pendientes",trigger:"Checklist incompleto",result:"Recordatorio para revisión humana",approval:"No enviar documentación sensible automáticamente"},
      {title:"Seguimiento de citas",trigger:"Cita confirmada",result:"Tarea en ARM",approval:"No dar consejo legal ni prometer resultados"}
    ]
  },
  {
    slug:"notaria",category:"Notaría",title:"Notary Studio",tagline:"Conoce los servicios, prepara requisitos y solicita una cita.",
    audience:"Clientes con documentos para notarización",accent:"from-slate-900 via-slate-700 to-rose-700",icon:"stamp",
    modules:[
      {title:"Tipos de documentos",description:"Consulta cuáles actos notariales realiza el profesional.",cta:"Consultar servicio"},
      {title:"Citas",description:"Formulario para pedir horario y modalidad.",cta:"Solicitar cita"},
      {title:"Requisitos",description:"Guía general de identificación y documentos.",cta:"Consultar requisitos"}
    ],
    tasks:[
      {title:"Revisar comisión",trigger:"Activación de profesional",result:"Estado de verificación administrativa",approval:"Validación humana de comisión y jurisdicción"},
      {title:"Preparar cita",trigger:"Solicitud recibida",result:"Checklist previo a la visita",approval:"Notarización siempre por persona facultada"},
      {title:"Recordatorio",trigger:"Cita próxima",result:"Aviso sujeto a consentimiento",approval:"Confirmación manual de disponibilidad"}
    ]
  },
  {
    slug:"finanzas",category:"Finanzas y operaciones",title:"Finance Studio",tagline:"Transforma información financiera en decisiones claras.",
    audience:"Empresas y emprendedores",accent:"from-emerald-950 via-emerald-800 to-teal-500",icon:"chart",
    modules:[
      {title:"Panel financiero",description:"Indicadores, ingresos y gastos con datos autorizados.",cta:"Explorar panel"},
      {title:"Flujo de caja",description:"Escenarios de liquidez y planificación.",cta:"Solicitar análisis"},
      {title:"Servicios CFO",description:"Presentación de paquetes y alcance profesional.",cta:"Consultar servicio"}
    ],
    tasks:[
      {title:"Importar información",trigger:"Archivo autorizado",result:"Resumen para revisión del cliente",approval:"No conectar bancos sin permiso"},
      {title:"Detectar variaciones",trigger:"Nuevo período financiero",result:"Lista de cambios y riesgos a revisar",approval:"Revisión humana antes de recomendaciones"},
      {title:"Seguimiento mensual",trigger:"Cierre de período",result:"Tarea de revisión en ARM",approval:"No ejecutar operaciones financieras"}
    ]
  },
  {
    slug:"marketing",category:"Marketing y diseño",title:"Growth Studio",tagline:"De una buena marca a una máquina comercial medible.",
    audience:"Negocios que quieren crecer",accent:"from-fuchsia-950 via-violet-800 to-pink-600",icon:"megaphone",
    modules:[
      {title:"Portafolio creativo",description:"Galería de proyectos y casos aprobados.",cta:"Ver proyectos"},
      {title:"Paquetes de marketing",description:"Branding, sitios web, contenido y automatización.",cta:"Solicitar propuesta"},
      {title:"Campañas y resultados",description:"Panel de rendimiento con métricas verificables.",cta:"Explorar resultados"}
    ],
    tasks:[
      {title:"Diagnóstico de marca",trigger:"Nuevo cliente registrado",result:"Brief y necesidades por prioridad",approval:"Cliente revisa y aprueba el brief"},
      {title:"Calendario de contenidos",trigger:"Campaña aprobada",result:"Borradores para revisión",approval:"Publicar solo con autorización"},
      {title:"Seguimiento comercial",trigger:"Lead entrante",result:"Responsable y próxima acción en ARM",approval:"No atribuir conversiones sin datos"}
    ]
  },
  {
    slug:"taxes",category:"Impuestos",title:"Tax Studio",tagline:"Organiza los documentos y solicita una consulta fiscal.",
    audience:"Personas y pequeños negocios",accent:"from-stone-900 via-amber-800 to-amber-500",icon:"calculator",
    modules:[
      {title:"Preparación tributaria",description:"Presentación del alcance y credenciales, cuando sean verificadas.",cta:"Solicitar consulta"},
      {title:"Organizador fiscal",description:"Checklist de documentos sin recopilar SSN en formularios públicos.",cta:"Ver checklist"},
      {title:"Calendario de fechas",description:"Recordatorios y fechas según tipo de contribuyente.",cta:"Explorar calendario"}
    ],
    tasks:[
      {title:"Clasificar solicitud",trigger:"Nuevo interesado",result:"Tipo de servicio y próxima cita",approval:"No pedir datos tributarios sensibles sin entorno seguro"},
      {title:"Preparar checklist",trigger:"Consulta confirmada",result:"Lista de documentos requerida",approval:"Revisión por preparador autorizado"},
      {title:"Revisar vencimientos",trigger:"Fecha relevante",result:"Recordatorio al equipo",approval:"Confirmar fechas vigentes"}
    ]
  },
  {
    slug:"seguros",category:"Seguros",title:"Insurance Studio",tagline:"Encuentra orientación para evaluar coberturas y solicitar una cotización.",
    audience:"Familias, conductores y negocios",accent:"from-sky-950 via-cyan-800 to-blue-500",icon:"shield",
    modules:[
      {title:"Tipos de cobertura",description:"Auto, salud y protección según acreditaciones.",cta:"Explorar coberturas"},
      {title:"Solicitud de cotización",description:"Formulario de interés sin datos médicos sensibles.",cta:"Solicitar cotización"},
      {title:"Preguntas frecuentes",description:"Información general para preparar una conversación.",cta:"Ver respuestas"}
    ],
    tasks:[
      {title:"Calificar interés",trigger:"Nueva solicitud",result:"Tipo de cobertura y canal preferido",approval:"Verificar licencia aplicable"},
      {title:"Asignar asesor",trigger:"Interés registrado",result:"Tarea a profesional habilitado",approval:"Consentimiento antes de compartir datos"},
      {title:"Renovaciones",trigger:"Fecha aportada por el cliente",result:"Recordatorio en ARM",approval:"Sin cotizaciones automáticas no verificadas"}
    ]
  },
  {
    slug:"home-improvement",category:"Contratistas y mejoras",title:"Home Improvement Studio",tagline:"Descubre proyectos, compara acabados y pide una cotización.",
    audience:"Propietarios y administradores",accent:"from-zinc-950 via-orange-900 to-orange-500",icon:"hammer",
    modules:[
      {title:"Antes y después",description:"Galería de trabajos reales autorizados por el contratista.",cta:"Ver proyectos"},
      {title:"Servicios por categoría",description:"Cocinas, baños, piscinas, exteriores y remodelaciones.",cta:"Explorar servicios"},
      {title:"Solicitud de presupuesto",description:"Formulario con ubicación, alcance y fecha esperada.",cta:"Solicitar presupuesto"}
    ],
    tasks:[
      {title:"Clasificar proyecto",trigger:"Formulario recibido",result:"Categoría, zona y prioridad",approval:"No prometer precio ni disponibilidad"},
      {title:"Preparar cotización",trigger:"Visita solicitada",result:"Tarea y checklist comercial",approval:"Presupuesto aprobado por contratista"},
      {title:"Seguimiento",trigger:"Cotización enviada",result:"Próximo contacto en ARM",approval:"Respetar preferencias del propietario"}
    ]
  }
] as const;
export function getDemoProfile(slug: string) { return demoProfiles.find((profile) => profile.slug === slug); }
