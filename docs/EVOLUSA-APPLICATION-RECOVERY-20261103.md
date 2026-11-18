# Solicitud profesional: recuperación de un envío fallido

Fuente: main remoto `3e3152169fbf9b08202c886c8a3396fd8fbd62b1` (3 noviembre 2026 UTC).

## Problema y cambio

En `/aplicar-profesional`, una promesa rechazada por la acción de servidor dejaba `pending=true`: el botón permanecía deshabilitado en «Enviando…». Ahora el rechazo muestra el error existente y `finally` libera el botón. Tanto el rechazo como `saved=false` conservan los datos. Solo una respuesta guardada permite pasar a crear cuenta/entrar; el fallo de sessionStorage sigue separado de un guardado exitoso.

No cambia validación del servidor, categorías, aprobación, atribución, roles, esquema, permisos, OAuth ni envíos externos. El pendiente de atribución del aliado en la solicitud profesional no queda resuelto por esta corrección.

## Comprobación reproducible

1. Completar los campos obligatorios del formulario en un entorno local.
2. Interrumpir el transporte de la acción antes de enviar; enviar.
3. Comprobar error, botón habilitado y datos conservados; restablecer transporte y reintentar.
4. Repetir con respuesta `saved=false`, después con guardado correcto y con sessionStorage bloqueado.

Se ejecutó un harness sobre el TSX real transpilado, con hooks React y acción de servidor sustituidos: rechazo, `saved=false`, éxito y éxito con almacenamiento bloqueado, cuatro casos PASS. Esto prueba el manejador del componente; no constituye prueba de navegador, escritura en producción ni envío real.

Harness conservado en WS12: `C:/AI-OPS/worktrees/evolusa-application-recovery-check-20261103.cjs`.

Revisión independiente de producto: GO. Última revisión de cumplimiento: ALLOWED; sin copy ni claims nuevos. Validación completa y estado de entrega se registran en ESTADO.md y la cola central al finalizar.
