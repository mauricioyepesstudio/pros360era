# EvolUSA — privacidad de enlaces, 2026-10-17

## Cambio y reproducción
Antes, sanitizeUrl/safeHttpUrl devolvían https://demo:sample@example.invalid/portfolio y podían aparecer como href/src de perfil. Ahora rechazan parsed.username o parsed.password, antes de normalización LinkedIn. No se retiran credenciales para enlazar silenciosamente otro destino: se omite el enlace no seguro según la política previa.

Se mantienen byteporbyte HTTP(S) válidos, incluidos TikTok /@usuario y @ en query/path/hash. Se cubren usuario solo, contraseña sola, codificación, host aparente linkedin.com@otro y redes completas. Ejemplos sintéticos, no credenciales reales.

Guardado futuro: self-profile usa getUser y eq(user_id,user.id), luego sanitiza. Lectura: /profesionales/[slug] carga vista aprobada → ProfessionalProfileView; ficha de conexión usa mismos guards. Validación de borradores/admin provisioning reutiliza sanitizeUrl. No hay migración, cambios de filas, roles o RLS. safeBookingHref separado permanece sin cambios; no afirmar seguridad universal de URLs ni limpieza retroactiva de base.

## Coordinación y validación
Checkout aislado evolusa-isolated-20261017; main remoto5c7d72989016be97d77ef3efab0dc033782e158a. Producción inicial READY dpl_5QBoyH4EVAcfkYFuwkEtSJgZxXzM. PR56auth/52sugerencias/45publicación/57skills intactos. Tarea target_repository_implementation evolusa-profile-url-credentials-20261017 reclamada con head/queue esperados. Skills evolusa-product/compliance/git-safe-workflow seguidos; main remoto explícito prevalece sobre la base histórica feat/evolusa-migration de la guía git.

215 pruebas PASS/0SKIP,19 focalizadas/4nuevas; TypeScript y build Next16.3 PASS81páginas,rutas dinámicas incluidas; lint0errores/7warningsprevios;diffcheckPASS. El primer typecheck detectó tipo débil de input calculado en test nuevo y se corrigió antes del pase completo. Revisión independiente producto/security/complianceGO. Preparado; PR/CI/commit integrado y SHA real de producción al cierre en cerebro central. Sin JSX/estilos ni aprobación de rediseño pendiente.

No sesión profesional de prueba autorizada: no afirmar guardar/recargar en cuenta real, navegador autenticado o RLS vivo. Próximo objetivo: perfil propio, guardar enlaces reales permitidos, recargar y comprobar destino, sin transferir información desde ADMIN.

## Perfil y contenido
HV y planner actuales del dueño materializados/leídos, mismos IDs. No modificar CV original ni copiarlo al repo. Planner Mauricio_Perfil_Planner_Real_Group.html actualizado de versión3a4 con propuesta2026-10-18, sin horario confirmado. Cuenta objetivo mauricioyepes01@gmail.com, noADMIN. Historial/perfil conservados, sin añadir estudios/credenciales/disponibilidad.

Pieza3 original RG_03.png reutilizada sin modificar, extracción rge-contenido-original.png para QA/entrega. Paleta negro/marfil/dorado real. Caption: El contenido empieza con una intención: qué queremos comunicar y a quién. Diseño, fotografía y video forman parte de mi experiencia. Si tu marca necesita una línea visual coherente, hablemos de tu proyecto. Conoce mi trabajo: https://mauricio-portfolio-v2.vercel.app/contact

Canales propuestos Instagram@rgentertainmentmanagement,Facebookmauricioyepespublicidad,LinkedIncompany/146496927. No admin/dashboard como CTA, domicilio/teléfono, métricas ni clientes sin permiso. QA imagen y texto GO;13PNGoriginales conservados;JSsyntaxPASS,no layoutbrowserQA. Producido reutilizado/listo aquí,NOprogramado/publicado. No autorización/conexión publicadora por canal ni ID/permalink de proveedor verificados en esta entrega. URLs no acreditan OAuth. No probar proveedor con mensajes.

EvolUSA conserva equivalente reciente del15 exec-11aac48f-1977-4aaf-800f-970f3b8fcd7a.png: Tu próximo paso/Cuéntanos qué necesitas,navy#061B3A/red#F20D24/blanco; no duplicado generado ni publicación externa.
