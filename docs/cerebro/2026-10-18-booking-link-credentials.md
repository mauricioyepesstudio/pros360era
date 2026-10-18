# EvolUSA — enlaces de reserva, 2026-10-18

Base main remoto 6b0802a922510db074e610652190745005cef732. Lease target_repository_implementation: evolusa-booking-url-credentials-20261018. PR45/52/56/57 ajenos intactos; no duplicar sus flujos.

## Cambio y reproducción

El guard canónico lib/opportunities/booking.ts antes devolvía `https://cal.com@evil.example/slot` o URLs con contraseña como href válido. Ahora devuelve null si URL.username/password no están vacíos. OpportunityProfessionalSummary ya oculta el botón de reserva cuando recibe null. HTTP(S) ordinarios pasan sin modificar, incluidas arrobas en ruta/query. No se modifica JSX, persistencia, esquema, RLS, cuentas, secretos, servicios regulados ni presupuesto. No es protección universal de URLs ni sincronización de agenda; no se limpian datos antiguos.

Ocho pruebas dedicadas (dos nuevas),217 pruebas de suite PASS, TypeScript PASS, lint0errores7warnings preexistentes. Build, CI exacto, revisión, PR y SHA real de producción al cierre central. Producto/security/compliance independientes GO; diff check PASS tras corregir blanco EOF documental. Sin sesión de prueba autorizada: no se afirma E2E autenticado ni reserva real. Próximo: verificar el enlace normal y rechazo sintético en proyecto/cuenta autorizados; no alterar perfiles reales para probar.

## Perfil y contenido propios

CV original libfile_117ca86c58608191a191c64177e9f1f9 versión0 y planner libfile_45432500acbc8191a55ec50d3f1bdb28 versión4 leídos/materializados. Planner reemplazado con guardia4→5, conservando historial,13 PNG y HV incrustados. Oct19 reutiliza pieza1 RG_01.png original; exportación rge-branding-original.png, sin modificar; no se presenta como nuevo creativo. Sintaxis JS y21IDs únicos PASS, sin QA de layout de navegador. Imagen y caption revisados; la imagen menciona enlace en bio, verificarlo antes de publicar.

Caption: Una identidad visual coherente ayuda a comunicar lo que hace tu negocio. Soy Mauricio Yepes: trabajo en branding, diseño y contenido digital. Conoce mi trabajo y cuéntame qué necesita tu marca: https://mauricio-portfolio-v2.vercel.app/contact

Canales propuestos: Instagram rgentertainmentmanagement, Facebook mauricioyepespublicidad, LinkedIn company/146496927 público. Cuenta propia mauricioyepes01@gmail.com separada de ADMIN; no transferencias ni cambios de cuenta. No se añaden credenciales, disponibilidad ni cifras. No se incluye domicilio/teléfono en creativos. Guardar/recargar el perfil requiere sesión propia autorizada.

Estado: producido reutilizado/listo para compartir aquí, NO programado/publicado. No hay autorización publicadora verificada por canal ni ID/permalink del proveedor en esta entrega; enlaces no acreditan OAuth. No se envían mensajes.

Creativo EvolUSA equivalente reciente conservado: exec-11aac48f-1977-4aaf-800f-970f3b8fcd7a.png, producido2026-10-15, navy#061B3A/red#F20D24/blanco, objetivo próximo paso en español. Sin duplicado nuevo. Caption: Cuéntanos qué necesitas y explora tu próximo paso con EvolUSA. Empieza aquí: https://evolusa.vercel.app/ . Listo aquí, no publicado.
