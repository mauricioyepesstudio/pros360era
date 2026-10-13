# EvolUSA — Visión del servicio de marketing autónomo con aprobación humana

Fecha: 2026-10-13. Requisitos expresados por Laura y Mauricio (12 de octubre).

## Resultado deseado
Cada profesional configura su identidad de marca, conecta voluntariamente sus canales mediante OAuth, establece objetivos y calendario y recibe propuestas semanales de IA. La IA genera varias opciones de copy y creativos por publicación, adaptadas a la marca. El profesional revisa, modifica y aprueba. Solo entonces el sistema programa y publica en canales autorizados, guarda evidencia de publicación y muestra resultados. Un CRM privado por profesional integra conversaciones, leads, origen, citas y seguimiento.

## Flujo editorial y estados
IDEA → GENERATED → IN_REVIEW → APPROVED → SCHEDULED → PUBLISHING → PUBLISHED.
REJECTED, FAILED y NEEDS_RECONNECT son estados de excepción. Cada aprobación registra usuario, versión del contenido, fecha y canales. Una edición posterior a la aprobación invalida la aprobación y requiere una nueva. Nada generado se publica por defecto. El profesional puede detener publicaciones futuras y revocar conexiones.

## Capacidades por fases
1. Planner: botón + Sugerencias, nuevos temas no duplicados, tres variantes de copy/imagen, edición, historial, guardado y aprobación explícita. El botón actual solo ofrece plantillas orientativas y reutiliza imágenes del kit; NO es IA real.
2. Brand profile: servicios, audiencia, tono, colores, tipografías, material autorizado, restricciones, idiomas, plataformas y frecuencia. Aislamiento de datos por propietario.
3. Generación: servicio backend autenticado, proveedor de texto e imagen configurable, moderación, coste y cuota por plan, caché, trabajos asíncronos y almacenamiento privado hasta aprobación. No afirmar que un proveedor está conectado sin comprobarlo.
4. Redes: OAuth individual de Instagram/Facebook, cifrado y renovación de tokens, scopes mínimos, permisos y revisión Meta. Adaptadores independientes para LinkedIn, web y otros canales solo si sus APIs y políticas permiten el caso de uso.
5. Publicador: cola durable, scheduler, idempotencia, reintentos con límites, observabilidad, permalink/ID externo, auditoría, estados reales, zona horaria y aviso de fallos.
6. CRM: contactos, conversaciones, leads, atribución por canal, citas, pipeline, roles, RLS, retención y privacidad. WhatsApp Business, Google Business Profile, Yelp, Apple Business Connect, Google Ads y LinkedIn Ads requieren integraciones y permisos específicos; no prometer disponibilidad hasta verificar.
7. Monetización futura: hipótesis Start $99, Growth $149, Pro $199/mes, sin activar cobros durante el piloto. Definir cuotas, márgenes y límites antes de cobrar. Presupuesto publicitario y servicios especializados se cobran aparte.

## Aceptación con Miguel y Laura
- Cada uno inicia sesión en su cuenta profesional y conecta solo sus redes sin entregar credenciales al administrador.
- Define un brand profile y pide una semana de contenido con frecuencia y canales.
- Recibe nuevas propuestas con al menos tres alternativas visuales y textos editables; puede rechazarlas o modificarlas.
- Puede aprobar una versión específica; nunca se publica una idea sin aprobación.
- El sistema programa y publica solamente en la cuenta autorizada, muestra evidencia externa o fallo recuperable.
- Miguel conserva sus tres posts existentes y la imagen subida; no migrar ni sobrescribir datos privados.
- Ningún profesional puede acceder a contenidos, tokens, CRM o campañas de otro.

## Estado de entrega
Documento de producto; no certifica que generación IA, publicación multicanal o CRM estén terminados. El PR #52 contiene una primera interfaz de sugerencias basadas en plantillas, no generación de imágenes con IA. No hacer merge ni desplegar sin CI, revisión y pruebas autorizadas.

## Decisión del dueño — piloto gratuito primero (2026-10-13)
- **No activar Stripe Live, suscripciones, paywalls ni cobros** durante el piloto. No pedir tarjeta a los participantes.
- Participantes iniciales: Miguel y Laura, con consentimiento individual y cuentas separadas. Acceso por invitación o allowlist; no abrir generación ilimitada al público.
- Alcance mínimo de punta a punta: onboarding de marca → OAuth individual → calendario semanal → generación real de textos y opciones visuales → edición y aprobación por persona → programación → publicación externa verificable → registro de estado, errores y métricas básicas.
- Los tres posts existentes de Miguel y su imagen del día 14 se conservan sin alteraciones; ningún contenido se publica sin su autorización.
- Establecer cuotas gratuitas de generación y presupuestos de infraestructura, sin trasladar cobros al usuario. Medir coste por cuenta y uso efectivo.
- Criterio para activar planes y pagos: flujos probados con cuentas de piloto, publicación confirmada con ID/permalink real, aislamiento entre usuarios, recuperación ante token vencido y fallos, auditoría de aprobaciones y costos conocidos. **Activación solo tras una nueva autorización explícita del dueño.**
- Integraciones adicionales (LinkedIn, Google, WhatsApp, CRM avanzado y Ads) son posteriores al primer circuito validado; no bloquear el piloto de Instagram/Facebook por ellas.

## Mi Evolución — expediente de acompañamiento del usuario (visión 2026-10-13)
El usuario tiene un perfil propio, independiente del panel profesional, con plan de necesidades y metas, profesionales elegidos, servicios contratados, tareas, documentos, mensajes, citas, hitos, recordatorios y alertas. El usuario puede ver su progreso y controlar quién accede a cada servicio. No se interpreta una lista de tareas como porcentaje de avance legal o garantía de resultado.

### Modelo funcional
- UserJourney: usuario, objetivos voluntarios, etapas configurables, preferencias de notificación.
- ServiceEngagement: profesional verificado, categoría, consentimiento explícito, alcance del servicio, estado y revocación.
- Milestone/Task: creador, responsable, fecha y fuente, estado, evidencia y última actualización; las fechas legales deben tener fuente verificable y responsable humano.
- Appointment/Message/Document: acceso restringido al usuario y profesionales específicamente autorizados, auditoría y reglas de retención.
- Notification: recordatorio configurable, evento verificable, canal, consentimiento, deduplicación y cancelación. Nunca inferir fechas de USCIS u otras agencias sin confirmación.
- Recommendations: basadas en necesidades expresadas y criterios transparentes; distinguir recomendaciones, promociones pagadas y relaciones comerciales; verificar licencias y atribuciones para profesiones reguladas.

### Privacidad y seguridad
RLS y aislamiento por usuario y engagement, permisos granulares y revocables, mínima recopilación de datos sensibles, cifrado, trazabilidad, exportación y eliminación según requisitos aplicables. No compartir expedientes migratorios, financieros, médicos o legales entre profesionales por defecto. No sustituir asesoría legal ni emitir decisiones sobre estatus migratorio.

### Validación piloto
Primero diseñar y probar un recorrido de usuario ficticio, una invitación de profesional, asignación consentida de tareas y una notificación simulada. Mantener separado del piloto de publicación hasta que sus controles de seguridad estén listos. No activar integraciones gubernamentales ni afirmar acceso a estados oficiales sin conexión y autorización verificadas.

## Corrección de alcance: agencia de agentes dentro de cada perfil (2026-10-13)
Miguel y Laura YA son usuarios que están probando EvolUSA y aportando solicitudes. No tratarlos como nuevos participantes por incorporar ni asumir que las conexiones están pendientes sin verificar el estado real por cuenta. Conservar su contenido y sus conexiones existentes.

**Producto:** un único Professional Command Center por profesional; director/orquestador IA con agentes especializados para identidad de marca, creatividad, planner/schedule, publicaciones, CRM, campañas y analítica. Skills = procedimientos reutilizables; conectores = permisos a sistemas externos; agentes = ejecutores de tareas. No exigir una suscripción externa de ChatGPT/Dots por cada profesional.

**Principios:** identidad, calendario, CRM y redes compartidos únicamente dentro de la cuenta del profesional; tenant isolation y RLS; credenciales por usuario; herramientas por rol; aprobaciones explícitas antes de publicar o gastar; auditoría; cuotas y límites de costo; reintentos seguros. No duplicar módulos existentes ni modificar publicaciones de Miguel/Laura.

**Inventario de código confirmado en main (no equivalencia a producción validada):**
- `lib/professional/self-profile.ts`: perfil privado.
- `app/(account)/crm/page.tsx`, migraciones CRM: gestión de contactos.
- `lib/social/connections.ts`, migraciones: conexiones sociales.
- `components/professional/PublicationPlanner.tsx`: planner.
- `lib/professional-planner/publisher.ts` y `app/api/social/planner/publish/route.ts`: publicador y cron.
- `lib/growth-automation/content-generator.ts`: generador de contenido Anthropic preexistente.
- `app/(account)/panel-profesional/planner/ai-actions.ts` en rama piloto: tres propuestas IA sujetas a clave y pruebas.

**Siguiente trabajo:** auditoría de brechas por cuenta con consentimiento (función disponible, prueba de Miguel/Laura, bug reportado, permisos, conexión y prueba end-to-end); unificar navegación y estado en Professional Command Center; orquestador que use los módulos existentes, no clones; tests de aislamiento, aprobación, idempotencia y costes; demos guiadas sobre las cuentas reales con aprobación de cada dueño. No desplegar cambios ni activar pagos sin autorización.
