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
7. Monetización: hipótesis Start $99, Growth $149, Pro $199/mes; definir cuotas, márgenes y límites antes de cobrar. Presupuesto publicitario y servicios especializados se cobran aparte.

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
