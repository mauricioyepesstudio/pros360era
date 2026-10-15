# EvolUSA — acceso y capacidad OAuth, 2026-10-15

PR existente #55: https://github.com/mauricioyepesstudio/pros360era/pull/55. No se abre otro PR propio. Base main a309fa6c3f94f953f34bd70735d4e126990ed512.

## Cambio

Se continúa el ajuste de entrada común y retirada de prompts de llamada genérica de PR55. Las reservas de profesionales emparejados permanecen intactas. Se aísla la comprobación pública de disponibilidad de Google en lib/auth/provider-capability.ts: requiere external.google boolean true; configuración ausente, HTTP fallido, JSON inválido, red fallida o cancelación mantienen Google deshabilitado. No simula OAuth ni habilita el proveedor. La consulta usa solo la clave pública, no credenciales privadas. El servidor continúa resolviendo el rol y autorizando el acceso.

Cinco regresiones cubren respuesta válida/inválida, errores, cancelación tardía y petición con clave pública. Suite completa: 205 pruebas PASS. ESLint sin errores (7 warnings preexistentes), TypeScript, build Next16.3 de producción y diff check PASS. Revisión independiente de producto/seguridad/cumplimiento GO. No cambios de esquema, RLS, roles, secretos, presupuesto, servicios regulados ni cuentas.

## Estado y límites

Preparado en PR55; no integrado, no desplegado y recorrido autenticado no verificado. Producción actual verificada por Vercel READY: a309fa6c3f94f953f34bd70735d4e126990ed512, deployment dpl_BR2kdEKpLfMeLkSxBAhsK7wnsKCG. Esto NO incluye PR55.

Pendientes antes de integrar: CI del commit nuevo, preview y navegador a375/768/1280, acceso MEMBER/PROFESSIONAL y Google real si el proveedor se habilita. Navegador local ausente; instalación Chromium ya falló hoy con ZIP inválido en el mismo entorno. No se elude ese bloqueo ni se presenta prueba unitaria como E2E. No hay cuenta de prueba autorizada disponible. SMTP/Google/live connections descritos el14 son históricos, no se confirman como configuración actual con esta revisión.

## Perfil y planner del dueño

Se materializaron y leyeron la HV original y el HTML vigentes indicados por el dueño. El HTML versión1 conserva la presentación y trayectoria declarada, sin inventar estudios ni certificaciones. Continuación propuesta para Oct16 reutiliza la pieza1 de branding ya producida; enlaces públicos IG, portfolio, LinkedIn empresa y Facebook; /admin/dashboard de LinkedIn permanece privado. Se mantiene historial Oct9–15. No se transfieren datos entre mauricioyepes01@gmail.com y ADMIN anterior ni se modifican datos de la app; comprobar el guardado/recarga requiere la sesión propia.

El planner se reemplaza bajo la misma identidad Library con guardia de versión; resultado final, archivo de creativo y evidencia en cerebro central. No guardar HV ni datos privados en este repositorio. El domicilio/teléfono del CV no se incluyen en creativos.

Contenido EvolUSA nuevo: pieza editorial con navy #061B3A, red #F20D24 y blanco, copy aprobado: Tu próximo paso / Cuéntanos qué necesitas. Archivo final en cerebro central. Producido/listo para compartir aquí, NO programado ni publicado externamente. Caption: Cuéntanos qué necesitas y explora tu próximo paso con EvolUSA. Empieza aquí: https://evolusa.vercel.app/

Próximo objetivo: QA de PR55 y aceptación de rol en sesión; verificar consentimiento/conexión de cada canal RGE antes de cualquier publicación. Tener URLs no acredita OAuth ni una entrega externa.
