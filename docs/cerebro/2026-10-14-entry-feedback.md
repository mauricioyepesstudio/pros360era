# Feedback de acceso y navegación — 2026-10-14

- Una entrada «Ya tengo cuenta» y un formulario de login común. La autorización y la resolución del rol siguen en el servidor; el registro conserva los dos recorridos.
- Un único acceso manual al recorrido desde «¿Cómo funciona?»; se mantiene la invitación inicial.
- Eliminado el texto literal `\n` del login.
- Eliminada la solicitud genérica de videollamada del shell y del registro. No redirigir el acceso hacia esa solicitud por `initialCall`. Las conexiones con profesionales mantienen su propio enlace de agenda.
- Planner: «Sugerencias de publicaciones», con contraste y ajuste de los controles en pantallas pequeñas. No se modifican posts, imágenes, generación ni publicación.
- Google: el endpoint público de Auth settings devuelve `external.google=false`; no hay acceso habilitado. El formulario consulta esa capacidad y no permite iniciar OAuth cuando está deshabilitada o no pudo verificarse.

## Límites pendientes

- Configurar credenciales Google OAuth y probar el acceso real. Este cambio no habilita el proveedor.
- SMTP: registros de Supabase del 13 de octubre muestran rechazo 550 de Resend por envío de prueba a destinatarios externos. Gmail SMTP requiere acceso verificado a la cuenta y contraseña de aplicación; todavía no se ha configurado.
- Agenda existente: preferencias profesionales y enlace externo de reservas. No hay un calendario nativo nuevo ni una cita creada por este ajuste.
- Sin cambios en cuentas, roles, suscripciones, datos reales ni piezas del planner.
