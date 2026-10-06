# EvolUSA — cambios para prueba de Laura

Fecha: 2026-10-06. Enlace estable: https://evolusa.vercel.app

## Entrega actual: CRM manual

PR28 integrado, commit a8a144cbf69100460249076a20e345f9e6af410c. Producción READY y migración crm_manual_capture_v1 aplicada. 91 pruebas, lint, TypeScript/build y revisión de seguridad aprobados. Verificados metadatos RLS/permisos en vivo y acceso sin sesión: APIs 401; formulario redirige a login conservando destino. No se afirma guardado autenticado ni QA visual móvil verificados.

### Acceso necesario

Usar una cuenta de prueba con rol PROFESSIONAL o ADMIN ya autorizado por el operador. MEMBER no tiene acceso CRM. Enviar solicitud de profesional no concede ese rol automáticamente. No cambiar rol ni compartir credenciales para sortear el bloqueo. Sin cuenta habilitada, marcar prueba CRM bloqueada y continuar pruebas públicas/de registro.

### Prueba breve

1. Iniciar sesión y abrir /crm/leads/new.
2. Crear un prospecto ficticio claramente identificado como PRUEBA LAURA; usar test-laura@example.com, fuente Referido y una nota de prueba. No ingresar datos de clientes reales.
3. Guardar una vez: debe llegar al listado /crm/leads y aparecer el prospecto.
4. Recargar listado y /crm: el prospecto debe persistir y las métricas de leads deben reflejarlo según filtros/periodo.
5. Intentar otra alta con el mismo correo: debe avisar que ya existe sin crear un duplicado; el formulario conserva datos ante fallo.
6. Comprobar campos vacíos, cancelar y navegación en teléfono y computador. Los módulos En preparación y redes no son conexiones activas.

La prueba crea un registro ficticio persistente. Esta entrega no permite editar/eliminar ni enviar mensajes; no probar con información real. No se solicita publicar ni contactar a terceros.

### Reportar cada resultado

Fecha, dispositivo/navegador, ruta, paso, esperado, observado y captura sin datos personales. Indicar aprobado, fallo o bloqueado. No incluir contraseña ni tokens. Un fallo de permisos se reporta como bloqueo, no como éxito.

## Historial breve

- PR24: visibilidad de enlaces de inicio y textos del directorio.
- PR26: navegación separada por rol.
- PR27: errores CRM explícitos y redes/automatizaciones pendientes sin éxito simulado.
- PR28: captura manual persistente y métricas reales.

Mantener este archivo por entrega: cada cambio debe indicar qué probar y qué sigue pendiente antes de pedir una nueva revisión.
