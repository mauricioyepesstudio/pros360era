# Threads: conexión propia y publicación desde el planner

Implementación: OAuth dedicado de Threads; `threads_basic` y `threads_content_publish`. El profesional debe iniciar la conexión desde su sesión. El callback exige estado firmado, nonce httpOnly y la misma sesión profesional; comprueba los permisos realmente concedidos mediante `debug_token`, cifra el token con la llave social y lo vincula al proveedor y a la cuenta. No reutiliza credenciales o permisos de Instagram/Facebook.

Configuración pendiente de comprobar en producción:

- App de Meta con caso de uso Threads; usar su **Threads app ID y secret**, que pueden diferir de las credenciales generales de Meta.
- Variables de servidor `THREADS_APP_ID`, `THREADS_APP_SECRET` y `SOCIAL_TOKEN_KEY`; servicio Supabase ya requerido por los callbacks sociales. No exponerlas con `NEXT_PUBLIC_`.
- Registrar exactamente `https://evolusa.vercel.app/api/social/threads/callback` (origen canónico de la app). HTTPS y dominio real; el ejemplo oficial no admite localhost.
- Configurar URL de privacidad y eliminación de datos según las exigencias de Meta; completar revisión/acceso requerido para cuentas fuera de los roles de prueba. Tener variables no demuestra aprobación de Meta.
- Migración `social_connections_threads` aplicada y comprobada en producción el 6 de noviembre: solo amplía el CHECK de proveedores; conserva RLS, grants y unicidad. Advisors sin nuevos tipos de hallazgos respecto de la consulta previa.

El módulo admite texto (máximo 500 caracteres), una imagen o un video por publicación. No implementa carruseles, respuestas, bandeja ni métricas. Meta descarga los archivos mediante URLs públicas. La creación del contenedor y su publicación son operaciones separadas: no se usa `auto_publish_text`. Se comprueba el procesamiento hasta cuatro veces, con intervalos de un minuto y fecha límite compartida; cada solicitud tiene límite de diez segundos. Un fallo ambiguo al publicar exige comprobar Threads antes de programar otra vez; no se reintenta automáticamente.

Se intercambia el código por un token de larga duración. Esta primera integración no renueva tokens de Threads automáticamente: al vencer se exige volver a conectar; la fecha se muestra en Redes conectadas. No se promete servicio indefinido ni publicación real sin una cuenta conectada y una prueba autorizada.

Fuentes oficiales consultadas el 5 de noviembre de 2026:

- https://github.com/fbsamples/threads_api (requisitos de credenciales, HTTPS y callback)
- https://github.com/fbsamples/threads_api/blob/main/src/index.js (hosts `.com`, intercambio largo, perfil y estado de contenedor)
- https://www.postman.com/meta/threads/documentation/dht3nzz/threads-api (colección oficial de Meta: creación y publicación separadas, medios públicos)
- https://developers.facebook.com/docs/threads/ (configuración y documentación; acceso de lectura limitado por Meta durante esta revisión)

Pruebas locales usan respuestas simuladas y no publican contenido. La aceptación final exige configuración real, consentimiento del propietario de la cuenta y una publicación de prueba expresamente autorizada.

Comprobación del 6 de noviembre: caso de uso Threads activo en la app Meta existente; evolusa.us figura entre los testers, permisos básicos y de publicación Ready for testing (0 llamadas). Callback aún apunta a localhost y faltan THREADS_APP_ID/THREADS_APP_SECRET en la configuración de producción. No se generaron tokens ni se mostraron secretos.
