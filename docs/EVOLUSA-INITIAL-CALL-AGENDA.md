# Videollamada inicial y agenda profesional — 2026-10-08

## Problema y alcance
Una persona que se registra necesita una opción de contacto inicial sin perder el contexto de usuario/profesional. Cada profesional necesita administrar su disponibilidad propia. El cambio incorpora una solicitud real y preferencias privadas; no equivale a un proveedor de reservas conectado.

- Signup: opción voluntaria, intención separada de next y conservada en login/confirmación. El handoff profesional permanece intacto.
- /videollamada-inicial: todos los roles autenticados. Nombre preferido, tema y disponibilidad general enumerados, zona IANA y consentimiento de correo específico. REQUESTED y CANCELED; cancelación retira consentimiento. No detalles sensibles.
- Una fila propia por cuenta, UUID personalizado versión8 determinista y upsert atómico, onboarding_responses initial-call-v1. Ningún owner/email/status arbitrario se recibe del formulario.
- /admin: API comprueba Auth y profiles.role ADMIN antes de service role; filtra REQUESTED, ID canónico, proyección mínima y hasta100 filas. Contacto derivado de Auth con concurrencia5. No emails ni mensajes.
- /panel-profesional/agenda: PROFESSIONAL/ADMIN con perfil profesional propio. Semana LUN-DOM con una franja diaria y zona IANA, ACTIVE/PAUSED. Disponibilidad orientativa privada, no slots ni bloqueo de horarios.
- Agenda guarda professional-schedule-v1 con UUID8 propio. booking_url sigue en professional_profiles, se valida HTTPS sin credenciales y permite quitarlo. Su guardado es independiente del horario; no promete una transacción entre tablas ni sincronización.
- Las tres versiones internas quedan excluidas antes del orden y límite de lecturas del Roadmap. No nuevas tablas, permisos, servicios regulados, credenciales ni cobros.

## Integración automática requerida
El objetivo posterior es que cada profesional autorice su calendario y pueda consultar disponibilidad real, reservar, reprogramar o cancelar citas y ver el resultado en su dashboard. Un plugin del agente no instala estas capacidades en la app.

Ruta propuesta: Cal.com API v2 con OAuth individual, calendario elegido por el profesional y webhooks verificados para reconciliar reservas. La documentación consultada el 2026-10-08 indica que nuevas integraciones parten de API v2; @calcom/atoms está en mantenimiento y la antigua creación de managed users no es el camino para clientes nuevos. Cada profesional conecta su cuenta mediante autorización; no crear cuentas de terceros ni aceptar términos por ellos.

Fuentes oficiales:
- https://cal.com/docs/atoms/setup (APIv2, OAuth client y aprobación por proveedor)
- https://cal.com/blog/calcom-v6-1 (cambio a Continue with Cal.com)
- https://cal.com/pricing (plan individual gratis, no supone integración multicuenta gratuita)
- https://developers.google.com/workspace/calendar/api/guides/create-events (eventos/conferencias bajo autorización)

Bloqueos concretos para la integración: falta OAuth client aprobado del proveedor, credenciales configuradas de forma segura, almacenamiento server-only cifrado de tokens y permisos revisados, autorización real por profesional y pruebas de reserva/reprogramación/cancelación/webhook. No se implementa un OAuth simulado, ni se promete creación automática de Meet. El servicio de reservas externo debe estar configurado para ello.

## Validación
Pruebas de parser, consentimiento/cancelación, aislamiento de intención/next, UUID idempotente, versiones Roadmap, horarios, roles y URL. SQL vivo previo en transacción revertida valida upsert propio, reintento sin duplicación, cancelación, denegación de datos ajenos y conservación de necesidades. La prueba revertida no es una solicitud real ni prueba de una llamada realizada.

## Pendiente tras desplegar
Verificar solicitud y cancelación en navegador autenticado; guardar/reabrir una agenda. Verificar commit exacto de producción. La cuenta profesional actual del usuario tiene PROFESSIONAL y perfil privado; sesión cloud disponible antes de este cambio es otra cuenta ADMIN. No confundirlas. Ninguna comunicación externa ni llamada se ejecutó.
