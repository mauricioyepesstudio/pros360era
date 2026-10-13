# Planner: imagen directa y sugerencias — 2026-10-13

## Necesidad y comportamiento

Miguel necesita seleccionar una imagen desde su dispositivo, sin enlaces privados de ChatGPT, y elegir ideas para llevarlas al calendario.

El editor del planner ofrece un selector JPG/PNG/WebP, visible antes del kit, con consentimiento explícito de imagen promocional pública. El servidor verifica sesión profesional con perfil propio, origen de la petición y el archivo real. La imagen se convierte a JPEG, se eliminan metadatos y se limita a 2048 píxeles por lado. La URL persistente se incorpora al borrador; debe guardarse explícitamente. Un cambio de imagen deja el post en IDEA para que no se publique un archivo nuevo por conservar un estado READY anterior. Un error conserva la imagen anterior y los cambios.

Sugerencias muestra conceptos del kit propio que no necesitan confirmación y tres plantillas editables de presentación, proceso y pregunta frecuente. No se presenta como generación por IA. Se seleccionan ideas y fecha, y se guardan por el mecanismo existente, únicamente como IDEA. Identificadores estables evitan duplicados; el límite del planner sigue siendo 200. Si falla el guardado, la selección sigue disponible para reintentar.

## Almacenamiento y límites

Migración generada con `supabase migration new planner_images`: `20261013191416_planner_images.sql`. Crea exclusivamente el bucket promocional `planner-images`, público, MIME JPEG y máximo 4 MiB. No añade políticas de escritura/listado para anon o authenticated. La ruta autenticada usa service role después del control de propietario y escribe `auth-user-id/random-uuid.jpg`, sin sobrescribir objetos.

El cuerpo multipart completo está limitado a 4 MiB antes de interpretarlo; por tanto debe elegirse un archivo menor de 4 MiB. Límite de decodificación 25 millones de píxeles. Se rechazan SVG, GIF, datos corruptos y imágenes animadas. El control de 200 imágenes por cuenta usa listado antes de escribir; peticiones simultáneas pueden superar levemente el umbral. No hay borrado ni eliminación automática de imágenes originales.

## Evidencia y límites de validación

Nueve pruebas nuevas ejercitan origen y ausencia de Origin, sesión, consentimiento, formatos falsos, tamaño de cuerpo, decodificación, eliminación de EXIF, dimensiones, límites de píxeles, falla de almacenamiento, sugerencias, estado IDEA, duplicados y capacidad. TypeScript, 193 pruebas completas y build de 78 rutas pasan. El coordinador registra CI y revisión del PR en el cerebro central.

**Estado: preparado, no integrado ni desplegado.** La revisión automática rechazó aplicar el bucket vivo porque crea una nueva exposición pública persistente y no identificó autorización explícita para ese cambio de almacenamiento. No se creó el bucket y no se sustituyó por otro mecanismo para eludir la decisión. Hace falta aprobación concreta del dueño para `planner-images` público, únicamente imágenes promocionales JPEG, sin escritura/listado directo de usuarios. El código está listo para revisar; el upload no está funcional en producción mientras falte este requisito.

No se dispone de una sesión profesional de prueba autorizada en el navegador para confirmar selección de archivo y persistencia de extremo a extremo. No afirmar que Miguel ya subió un archivo o que estas sugerencias fueron publicadas en sus redes. Ningún contenido ni planner privado de usuarios fue modificado por esta implementación.

## Próximo objetivo

Probar con Miguel o una cuenta de prueba autorizada: abrir el planner, marcar uso público, subir imagen, guardar IDEA, recargar, seleccionar dos sugerencias y comprobar que se conservan en calendario. La publicación externa requiere decisión explícita del profesional mediante su planner.
