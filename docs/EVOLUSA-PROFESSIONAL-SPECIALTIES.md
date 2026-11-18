# Especialidades de ingreso y cuentas operadoras

Decisión del dueño, 2026-11-05: EvolUSA recibe perfiles de distintas especialidades y Real Group administra la plataforma separado del perfil profesional de Mauricio.

| Perfil o especialidad | Solicitud / contexto privado | Alcance |
| --- | --- | --- |
| Agentes inmobiliarios | REAL_ESTATE / real-estate | Solicitud sujeta a revisión |
| Seguros de salud / médicos | HEALTH_INSURANCE / health-insurance | Solicitud sujeta a revisión de licencia y alcance |
| Seguros de auto y accidentes de tránsito | AUTO_INSURANCE / auto-insurance | Solicitud sujeta a revisión; sin confirmar cobertura |
| Preparadores de impuestos | TAX / tax | Solicitud sujeta a revisión |
| Miguel: finanzas | FINANCE / finance | Especialidad distinta de operaciones; sin cambiar su categoría revisada por inferencia |
| Laura: paralegal y apoyo documental | PARALEGAL / paralegal | Su categoría revisada existente permanece IMMIGRATION_DOCUMENT_SUPPORT |
| Marie: notaría | NOTARY / notary | Conservar su perfil aprobado y sus datos |
| Mauricio: marketing | BUSINESS_MARKETING / marketing | Cuenta profesional propia, separada del operador |
| Real Group Entertainment | ADMIN | Administración; no es una opción de especialidad |

El formulario y el borrador privado comparten applicationCategoryOptions. Los identificadores nuevos son solicitudes: no amplían professionalCategoryIds, RPCs de matching, categorías de aprobación, cobros ni credenciales. El esquema vivo de professional_applications no tiene CHECK de categorías (verificado en esta entrega), por lo que no necesita migración.

El contexto privado tiene actividades finance y tax para preparar preguntas y organizar información. No ofrece asesoría individualizada ni acredita licencias. Los contextos existentes no se sobrescriben automáticamente. Registrar una solicitud no convierte una cuenta MEMBER en PROFESSIONAL ni modifica ADMIN.

## Cuentas existentes verificadas

Mauricio ya tiene una cuenta PROFESSIONAL de marketing y Real Group otra cuenta ADMIN. No se cambian sus roles. Marie tiene una única cuenta autenticada por Google: las otras entradas eran dos solicitudes obsoletas de marketing, retiradas por pedido del dueño. Se actualizó el contacto comercial en su solicitud de notaría, conservando su perfil, website, Instagram y cuatro entradas del planner. Esto no cambia su identidad de Google ni su contraseña.

Validación: 360 pruebas aprobadas en esta rama, TypeScript correcto, lint sin errores (cinco avisos anteriores) y build de producción correcto. La respuesta HTML de /aplicar-profesional se comprueba sin enviar solicitudes. Revisión independiente de producto, seguridad y cumplimiento: GO para recepción de solicitudes y contexto privado. La cuenta ADMIN se identifica ahora como Real Group Entertainment; Mauricio conserva su cuenta PROFESSIONAL y perfil de marketing propios. La identidad de Google de Marie sigue sin cambiar.


## Vincular otro Google a la misma cuenta

En /panel-profesional/perfil#mi-acceso se muestran solo los correos Google de la sesión propia. El titular inicia la vinculación con linkIdentity y selección explícita de cuenta, no con un registro o signInWithOAuth. El regreso PKCE comprueba el UUID autenticado antes y después del intercambio usando la cookie de sesión firmada existente; una sesión distinta se cierra localmente. No se cambia el correo principal, ninguna contraseña, rol o perfil, ni se elimina un acceso existente. Si la identidad ya pertenece a otra cuenta, no se fusiona.

Requisito vivo verificado: Google está habilitado y Allow manual linking está desactivado. Activar esa opción global requiere confirmación del dueño antes de realizar el cambio; luego cada titular debe autorizar el Google que añade. Para Marie, entrar primero con su Google anterior y desde Mi perfil vincular el nuevo; al volver debe aparecer en la lista antes de usarlo para iniciar sesión. No crear otro perfil.

Fuentes oficiales: https://supabase.com/docs/guides/auth/auth-identity-linking y https://supabase.com/docs/reference/javascript/auth-linkidentity. No se usan claves administrativas para este flujo.

Validación de la ampliación final: 374/374 pruebas aprobadas, TypeScript correcto, lint sin errores (cinco avisos anteriores), build de producción correcto y ambas opciones de seguros presentes en el HTML generado. Revisión independiente del flujo Google y seguros: GO; no se afirma autorización OAuth real ni activación de vinculación manual.
