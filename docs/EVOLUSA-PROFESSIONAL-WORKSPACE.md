# Espacio profesional — 2026-10-06

El formulario público confirma el envío y ofrece crear cuenta o entrar a
`/dashboard/professional`. Una cuenta autenticada puede preparar su presentación
privada sin esperar un cambio de rol ni la aprobación pública.

El borrador conserva nombre, área de interés, ciudad, pitch, experiencia y enlaces
Instagram/Facebook/portafolio. Se guarda como respuestas privadas de onboarding,
con `roadmap_version = professional-draft-v1`; los diagnósticos del Roadmap
excluyen esa versión. Cada guardado crea una revisión y se lee la última propia.
El formulario conserva temporalmente nombre/área/ciudad/bio en sessionStorage;
al entrar con el mismo correo en ese navegador se inicializa el borrador privado
solo si todavía no existe. No almacena contraseña; no autoriza ni reclama
solicitudes ajenas. Si el navegador bloquea almacenamiento, se completa a mano.
No hay migración ni cambios de grants, roles o aprobación. Las políticas existentes
limitan INSERT/SELECT/UPDATE al `auth.uid()` propietario. El servidor deriva la
identidad de la sesión, valida tipos/longitudes/categorías/URLs y devuelve solo
el estado del guardado. El borrador no sustituye el formulario de solicitud ni
se vincula a solicitudes anónimas mediante coincidencia de correo. El administrador
sigue revisando las solicitudes existentes; no recibe automáticamente el borrador.

`/professional-setup` redirige al espacio autenticado para retirar el recorrido
antiguo con datos de 1MIGRATION y estados ficticios de conexión. El editor del
perfil aprobado y las oportunidades conservan sus permisos existentes.

Los enlaces sociales NO son autorización OAuth. No se recogen contraseñas ni se
habilitan publicaciones. El callback OAuth heredado aún no persiste conexiones;
antes de activarlo hacen falta app/configuración Meta, estado de un solo uso ligado
a sesión, scopes verificados, almacenamiento privado de tokens, revocación y
prueba real. No se presenta ninguna cuenta como conectada en este recorrido.

Validación: lint (0 errores; warnings preexistentes), TypeScript, 77 pruebas y
build. Prueba viva en transacción revertida: INSERT/SELECT propio funciona;
INSERT/SELECT de otro usuario es rechazado. No quedaron usuarios/datos de prueba.
Recorrido web autenticado completo y despliegue pendientes de publicación.

## Disponibilidad de CRM y crecimiento — 2026-10-06

El panel separa miembros y profesionales; los solicitantes conservan su borrador privado en `/dashboard/professional`. Las herramientas de crecimiento están **en preparación**: sus pantallas informan indisponibilidad y todos sus endpoints devuelven 503 antes de iniciar OAuth, intercambiar tokens, generar, programar o publicar contenido. El catálogo no ofrece este módulo como servicio habilitado. La reactivación requiere implementar y verificar consentimiento, estado OAuth ligado a sesión, persistencia segura, propiedad de cuentas y confirmación real de publicación; no basta con configurar credenciales.

El dashboard CRM conserva el alcance del usuario autenticado. Un error de consulta devuelve 503; la interfaz muestra un error con reintento y rechaza respuestas incompletas. Solo una consulta válida sin filas representa cero contactos. No se han aplicado migraciones ni habilitado cobros.

## Entradas y confirmación de cuenta — 2026-10-06

“Ya tengo cuenta” ofrece **Soy usuario** (perfil/proceso personal) y **Soy profesional** (presentación/servicios). Las dos entradas usan la misma cuenta y contraseña; elegir una no cambia la autorización. Un solicitante con cuenta MEMBER puede preparar su borrador privado en `/dashboard/professional`. Un acceso PROFESSIONAL ya habilitado entra en `/panel-profesional`; la aprobación pública y la verificación de identidad siguen separadas.

Enviar el formulario profesional guarda una solicitud, no crea automáticamente la cuenta ni publica un perfil. Crear una cuenta, confirmar el correo y entrar permite continuar el espacio privado. Un correo ya confirmado debe usar login; repetir signup puede producir una respuesta genérica sin enviar otro correo. La pantalla no afirma entrega: ofrece login, corregir correo y solicitar otra confirmación con espera de 60 segundos y los límites del proveedor. Un login rechazado por correo sin confirmar ofrece el mismo recorrido de recuperación. La espera es de interfaz, no sustituye el límite de Supabase.

Prueba manual pendiente con una cuenta autorizada: abrir las dos entradas; entrar con cuenta confirmada; comprobar perfil/proceso personal; entrar por Soy profesional y guardar presentación privada; recargar y verificar persistencia propia. Para acceso profesional ya habilitado, comprobar destino panel y estado real del perfil. Para una cuenta nueva pendiente, verificar confirmación/reenvío y límites usando su propio buzón. No activar roles ni marcar correos confirmados durante estas pruebas. No afirmar que una confirmación llegó sin comprobar el buzón.
