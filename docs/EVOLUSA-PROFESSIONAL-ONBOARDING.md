# Continuidad profesional

Solicitud anónima -> cuenta autenticada -> /dashboard/professional. La confirmación ofrece registro y acceso; next se valida y conserva al cambiar entre login y signup. El registro genérico ya no preselecciona el correo de Laura.

El dashboard muestra datos reales del perfil propio, cuando existe. No concede rol ni aprobación por enviar una solicitud. Cuenta sin perfil: explica la revisión pendiente; no consulta solicitudes por correo. Editor existente /panel-profesional/perfil conserva rol y RLS.

Pendiente para cumplir el recorrido completo: perfil borrador de solicitante asociado a auth.uid tras verificar titularidad; almacenamiento privado, prellenado seguro de solicitud y pitch editable; OAuth real con consentimientos por finalidad, estado y revocación. No usar coincidencia de correo como autorización. No activar redes sin proveedor/configuración y pruebas.

Validado localmente: lint, tsc, 74 pruebas, build. No se modificó esquema ni permisos de base en este incremento.
