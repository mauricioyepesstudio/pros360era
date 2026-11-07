# 3 noviembre 2026 — recuperación de solicitud profesional

Cambio preparado desde main remoto `3e3152169fbf9b08202c886c8a3396fd8fbd62b1`: un rechazo de transporte ya no deja el formulario de solicitud permanentemente en «Enviando…». Error existente, datos conservados y reintento habilitado. Cuenta/aprobación siguen separadas.

Producto: GO. Cumplimiento final: ALLOWED. Harness del componente real con dobles: cuatro casos PASS; no navegador ni producción. Suite 354/354, TypeScript 0, lint 0 errores y 5 advertencias previas. Build de producción y diff-check PASS.

PR previos abiertos revisados: #86 (correo público), #52 (sugerencias planner), #45 (publicador). No abrir otro PR propio mientras #52 siga abierto. Rama preparada para revisión sin integrar ni desplegar. No sobrescribir esos PR con un cambio ajeno a su alcance.

Producción observada: alias evolusa.vercel.app, READY, deployment `dpl_FEXnHXgAtEWiSgT4QpdDkim9yPBt`, SHA `3e3152169fbf9b08202c886c8a3396fd8fbd62b1`. Esa versión no contiene esta recuperación. Google y email habilitados en settings públicos Auth, HTTP200 a 2026-11-03T02:10:19.418Z; esto no prueba login ni recepción SMTP. Requisito conjunto pendiente: sesión propia autorizada para MEMBER/PROFESSIONAL y prueba de acceso/entrega con remitente de dominio confirmado y verificado. No se enviaron mensajes ni se modificó configuración.

Planner/CV: lectura de los IDs suministrados falló con `Transport closed`; segundo intento del planner igual. No editar ni reemplazar el planner sin leer la versión actual. No producir otra pieza a ciegas; conservar historial de RG01/RG02/RG03, sin afirmar que siguen cubriendo la fecha próxima. Sin publicación social.

Próximo: resolver revisión/consolidación del PR propio #52 antes de abrir un nuevo PR; después aceptación del formulario con fallo de transporte en navegador. Atribución de aliado a solicitud profesional y aceptación autenticada continúan pendientes; esta corrección no los marca resueltos.
