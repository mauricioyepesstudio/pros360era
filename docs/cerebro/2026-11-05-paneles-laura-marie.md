# Paneles Laura y Marie — verificación del 5 de noviembre de 2026

## Evidencia viva

- Navegador conectado: sesión ADMIN de Mauricio; acceso a panel profesional y administración comprobado.
- Laura: cuenta confirmada, rol PROFESSIONAL, perfil aprobado, categoría IMMIGRATION_DOCUMENT_SUPPORT. Instagram onemigration registrado ACTIVE con permisos de publicación y vencimiento futuro. Esto no equivale a comprobar el token contra Meta.
- El registro del reel `reel-usuario-ig`, programado para 2026-11-05T17:00:00Z, muestra FAILED por tiempo de procesamiento de Instagram.
- Marie: cuenta confirmada, rol PROFESSIONAL, perfil NOTARY aprobado y website guardado. Planner persistido con cuatro ideas; sin conexiones sociales registradas. Existen solicitudes históricas duplicadas con categoría/correo diferentes: no se modificaron.
- No se dispone de sesiones de Laura ni Marie en el navegador. No se solicitan ni cambian sus contraseñas.

## Corrección acotada

Instagram consultaba el estado de un Reel 22 veces con intervalos de dos segundos: abandonaba cerca de los 42 segundos. Se amplía a cuatro consultas separadas por un minuto, con plazo absoluto compartido de 240 segundos y límite de diez segundos por petición. El cron deja sin reclamar las publicaciones que no caben para su siguiente ejecución. El botón manual pasa de 90 a 280 segundos para no cortar antes que el servidor. Si se pierde la respuesta a media_publish, el panel indica incertidumbre y pide comprobar Instagram antes de reprogramar.

No se reintenta ni reprograma el reel fallido. No se envían mensajes, correos o publicaciones de prueba; no se modifican cuentas, categorías, permisos, claves, RLS ni configuración de Meta.

## Alcance pendiente

Esta es una mitigación del tiempo de espera, no reanudación persistente: si el Reel aún no termina alrededor de los tres minutos, se conserva un fallo. Facebook y las consultas a base de datos mantienen sus límites previos. La revisión completa de cada panel requiere la sesión de su titular. Marie debe autorizar la conexión de su red. El workflow acceptance.yml mencionado en agencia.md no existe en main; su ejecución no se afirma.

## Validación

Siete pruebas nuevas cubren un Reel que termina a los dos minutos, ERROR/EXPIRED sin publicar, procesamiento acotado, deadline compartido, respuesta de publicación perdida y aplazamiento de nuevos intentos. Revisión independiente: GO para esta corrección acotada; siete pruebas nuevas PASS. Validación local completa: 365/365 pruebas, TypeScript, lint sin errores (cinco avisos previos) y build de producción aprobados. El build conserva un aviso previo de tracing en creative-media.ts. Navegador ADMIN: panel, planner persistido y CRM cargan; sin escrituras. El estado de integración y despliegue se documenta en el PR.
