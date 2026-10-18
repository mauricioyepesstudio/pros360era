# Roadmap y registro — petición del dueño, 2026-10-18

Base remota main5e95c77393d45321bd0a8ff766e170af5f216c5d en checkout aislado. Lease target_repository_implementation evolusa-roadmap-signup-user-20261018. PR45/52/56/57 ajenos preservados, en especial PR56 Auth en borrador; no se incorpora su callback/retorno sin revisión.

## Home

JourneyOverview aparece inmediatamente después del hero. Seis tarjetas01–06 importan journeyStages y muestran los mismos nombres y títulos: Llega, Establécete, Emprende, Protégete, Crece, Evoluciona. Hero móvil/escritorio enlazan a #journey junto al acceso existente. Tarjetas y CTA principal abren /onboarding público real; no se usa /camino inexistente ni se promete selección de etapa persistida. No se exige registro para ver el resultado inicial. Disclaimers canónicos y guía educativa visibles; no se presenta el recorrido como permiso migratorio o asesoría individualizada. Fotografías, servicios, motor, datos y fuentes originales preservados.

## Causa comprobada del error de registro

Captura enviada por dueño muestra error genérico al crear cuenta, no error de red. Logs Auth del proyecto EvolUSA, ventana2026-10-17T17:45Z a2026-10-18T17:45Z, devolvieron4 registros /signup500 con unexpected_failure y rechazo SMTP550: proveedor Resend en modo pruebas restringe destinatarios. Para corregir envío real: verificar dominio propio en Resend y configurar from de ese dominio en SMTP de Supabase. No se dispone en esta entrega de dominio remitente autorizado/verificado ni acceso para modificar esa configuración; no se cambian DNS, secretos, correo, confirmación, roles o cuentas. No desactivar confirmación para ocultar el problema. Google independiente; no habilitado por esta entrega.

Código conserva error.code además de message; allowlist devuelve español útil para envío/configuración, correo inválido, contraseña, límites y registro deshabilitado. Desconocidos genéricos, sin datos personales ni enumeración. No registrar provider raw en interfaz. No se afirma que un registro/correo real funcione por pasar tests.

## Validación

222 tests PASS/0SKIP; TypeScript/build81rutas PASS; lint0errores7warnings existentes y diffcheck PASS. Cinco regresiones Auth nuevas,11 focalizadas. Instalación navegador local falla por ZIP truncado; no repetir indefinidamente. Workflow browser separado sin secretos, entorno sintético, construye sitio y prueba375/768/1024/1280 normal/reducido, orden6etapas, enlaces y ausenciaoverflow, superposiciónHero y CTAonboarding; error SMTP interceptado en navegador, sin solicitudes Auth reales. Estado definitivo de CI/revisión/PR/SHAproducción en cerebro central; no inferir resultados pendientes.

Próximo: dominio remitente autorizado, verificación DNS y SMTP para completar registro/confirmación reales; comprobar correo recibido solo con destinatario de prueba autorizado. No se envían mensajes en esta entrega. No se producen nuevas publicaciones sociales.
