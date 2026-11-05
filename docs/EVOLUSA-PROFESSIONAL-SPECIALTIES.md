# Especialidades de ingreso y cuentas operadoras

Decisión del dueño, 2026-11-05: EvolUSA recibe perfiles de distintas especialidades y Real Group administra la plataforma separado del perfil profesional de Mauricio.

| Perfil o especialidad | Solicitud / contexto privado | Alcance |
| --- | --- | --- |
| Agentes inmobiliarios | REAL_ESTATE / real-estate | Solicitud sujeta a revisión |
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
