# Conexión Meta vencida: continuación de PR99 — 9 noviembre 2026

Fuente: main remoto b2b621510b2cb969afc7fb460006a9b3e3b34400; worktree aislado; tarea request-2026-10-20-evolusa reclamada mediante CAS como codex-evolusa-meta-expiry-20261109. Se continúa PR99 existente, sin crear otro.

Meta código 190 se distingue de un error ordinario. El planner guarda FAILED con una instrucción de reconexión, marca EXPIRED solo para user_id/provider/provider_account_id/token_ciphertext/ACTIVE rechazados y deja de enviar los demás posts de esa red en la corrida. Una reconexión concurrente conserva su credencial nueva. Si falla guardar EXPIRED, la corrida se detiene tras conservar FAILED. No se cambia el CHECK ni permisos.

Reconciliación importante: InstagramPublishError conserva publicationUncertain en el segundo argumento; tokenInvalid ocupa el tercero. Un timeout tras media_publish conserva el mensaje de incertidumbre, sin declararlo no publicado ni token vencido. Se mantienen LinkedIn/Threads, sus autorizaciones por pieza y los límites de tiempo actuales.

Aceptación reproducible: npm ci; npm test; npx tsc --noEmit; npm run lint; npm run build; git diff --check. La prueba planner-token-expiry ejecuta el publicador real transpilado con dobles de almacenamiento, descifrado y redes: aislamiento, corte de siguientes posts, reconexión concurrente, fallo ordinario, incertidumbre y fallo del UPDATE. Las pruebas de adaptadores usan respuestas HTTP de fixture. No son OAuth simulado ni aceptación real de Meta.

Revisión independiente: GO producto/seguridad; ALLOWED cumplimiento. EXPIRED está permitido por el CHECK existente y Redes ya muestra reconexión. Sin nueva superficie visual ni cambio de configuración.

Comprobación de dependencias: 9 noviembre 14:24Z settings HTTP200, Google/email habilitados, confirmación requerida. Los cuatro secretos E2E conservan fechas del 20 octubre: no repetir el ensayo MEMBER que devolvió ADMIN sin cambio de credenciales. Logs Auth 8 noviembre14Z–9 noviembre14Z:64 eventos,0 menciones Resend,0 rechazos de remitente de prueba; ausencia de error no prueba entrega y no resuelve el rechazo histórico. Requisito SMTP retenido: dominio remitente propio confirmado/verificado y destinatario autorizado para comprobar recepción. No se envió correo ni cambió DNS/secreto.

Preparado/probado; integración, despliegue y SHA de producción se registran en PR99 y evidencia final de la cola. No se llama el cron ni se publica una pieza para probar este cambio. El planner RGE v8 y las campañas recientes se conservan: no se duplica contenido ni se edita un archivo sin leer su versión actual.
