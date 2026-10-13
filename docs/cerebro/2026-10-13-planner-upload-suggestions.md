# Planner: imagen directa y sugerencias — 2026-10-13

## Necesidad y comportamiento

Miguel necesita seleccionar una imagen desde su dispositivo, sin enlaces privados de ChatGPT, y elegir ideas para llevarlas al calendario.

El editor del planner ofrece un selector JPG/PNG/WebP, visible antes del kit, con consentimiento explícito de imagen promocional pública. El servidor verifica sesión profesional con perfil propio, origen de la petición y el archivo real. La imagen se convierte a JPEG, se eliminan metadatos y se limita a 2048 píxeles por lado. La URL persistente se incorpora al borrador; debe guardarse explícitamente. Un cambio de imagen deja el post en IDEA para que no se publique un archivo nuevo por conservar un estado READY anterior. Un error conserva la imagen anterior y los cambios.

Sugerencias muestra conceptos del kit propio que no necesitan confirmación y tres plantillas editables de presentación, proceso y pregunta frecuente. No se presenta como generación por IA. Se seleccionan ideas y fecha, y se guardan por el mecanismo existente, únicamente como IDEA. Identificadores estables evitan duplicados; el límite del planner sigue siendo 200. Si falla el guardado, la selección sigue disponible para reintentar.

## Almacenamiento y límites

Migración generada con `supabase migration new planner_images`: `20261013191416_planner_images.sql`. Crea exclusivamente el bucket promocional `planner-images`, público, MIME JPEG y máximo 4 MiB. No añade políticas de escritura/listado para anon o authenticated. La ruta autenticada usa service role después del control de propietario y escribe `auth-user-id/random-uuid.jpg`, sin sobrescribir objetos.

El cuerpo multipart completo está limitado a 4 MiB antes de interpretarlo; por tanto debe elegirse un archivo menor de 4 MiB. Límite de decodificación 25 millones de píxeles. Se rechazan SVG, GIF, datos corruptos y imágenes animadas. El control de 200 imágenes por cuenta usa listado antes de escribir; peticiones simultáneas pueden superar levemente el umbral. No hay borrado ni eliminación automática de imágenes originales.

## Evidencia y límites de validación

Nueve pruebas nuevas ejercitan origen y ausencia de Origin, sesión, consentimiento, formatos falsos, tamaño de cuerpo, decodificación, eliminación de EXIF, dimensiones, límites de píxeles, falla de almacenamiento, sugerencias, estado IDEA, duplicados y capacidad. Siete pruebas adicionales cubren CSV, XLSX real, selección, fechas, duplicados y archivos comprimidos peligrosos. TypeScript, 200 pruebas completas, lint sin errores (7 avisos existentes), build de 78 rutas y diff check pasan. El coordinador registra CI y revisión del PR en el cerebro central.

**Estado: preparado; PR [#51](https://github.com/mauricioyepesstudio/pros360era/pull/51).** El rechazo inicial de revisión automática se resolvió con autorización específica del dueño el 2026-10-13. Se aplicó exclusivamente `planner_images` y se verificó el bucket público JPEG de 4194304 bytes, sin políticas de escritura/listado directo de usuarios. No se usó un mecanismo alternativo para eludir la revisión. La integración y el despliegue del código se registran en el cerebro central al completar CI.

## Importar parrilla existente

Botón dentro del mismo planner: CSV y Excel XLSX de una sola hoja, hasta 2 MB, 200 filas y 30 columnas. El archivo se interpreta localmente; solo se guardan las filas seleccionadas. Columnas en español o inglés: fecha, red y título; hora, texto e imagen opcionales. Fechas AAAA-MM-DD o DD/MM/AAAA, hora del Este y 12:00 si se omite. Vista previa con errores por fila; añadido sin sustituir el calendario y únicamente como IDEA. Identificadores estables impiden importar el mismo borrador repetidamente.

ZIP descomprimido por streaming con límite real, XML sin DTD/entidades y sin ejecución de fórmulas/macros o consulta de enlaces. Excel con fechas 1904 o varias hojas se rechaza explícitamente para evitar fechas o parrillas equivocadas. DOCX no admitido: copiar la tabla a Excel y exportar CSV/XLSX. No es sincronización OAuth de calendarios externos. Revisión independiente de seguridad aprobada; archivo con 8 MB ocultos tras tamaño falso rechazado en 12 ms.

No se dispone de una sesión profesional de prueba autorizada en el navegador para confirmar selección de archivo y persistencia de extremo a extremo. No afirmar que Miguel ya subió un archivo o que estas sugerencias fueron publicadas en sus redes. Ningún contenido ni planner privado de usuarios fue modificado por esta implementación.

## Próximo objetivo

Probar con Miguel o una cuenta de prueba autorizada: abrir el planner, marcar uso público, subir imagen, guardar IDEA, recargar, seleccionar dos sugerencias y comprobar que se conservan en calendario. La publicación externa requiere decisión explícita del profesional mediante su planner.
