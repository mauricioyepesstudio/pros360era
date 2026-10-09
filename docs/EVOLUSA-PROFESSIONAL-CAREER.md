# Trayectoria profesional — 2026-10-09

Entrega revisable: [PR #40](https://github.com/mauricioyepesstudio/pros360era/pull/40).
Preparado desde main `f587d7e`; controles, integración y commit real de producción
se registran en la tarea central `evolusa-resume-profile-20261008`.

Los perfiles profesionales propios pueden editar Presentación, Experiencia,
Formación, Habilidades y Credenciales/cursos. Los dos editores usan los mismos
campos, parser y vista previa. La vista pública y la ficha de conexión siguen
leyendo exclusivamente la vista pública aprobada existente; guardar no aprueba
un perfil.

La persistencia usa el campo existente `professional_profiles.bio`, con el
marcador legible `Perfil profesional EVOLUSA v1` y cinco encabezados exactos y
ordenados. No se añade tabla, permiso ni estado de verificación. El límite
agregado de 10000 caracteres se valida en el editor y en ambos caminos de
servidor. Una biografía anterior o un formato incompleto se conserva completo
como Presentación, sin inferir experiencia o credenciales.

Los datos son declarados por el profesional. EVOLUSA no verifica una credencial
por aparecer en estas secciones, y la verificación de identidad conserva un
significado separado. No se inventan empleadores, títulos, fechas o resultados.
Las secciones vacías no se muestran en público y la ficha de conexión muestra
solo la Presentación, nunca los encabezados de almacenamiento.

Esta entrega no importa hojas de vida, no sube PDF, no usa OCR o IA y no publica
perfiles pendientes. Una futura importación requeriría almacenamiento privado,
consentimiento, retención definida, extracción revisable y controles de acceso.

Validación local: 129 pruebas, TypeScript y build aprobados; ESLint sin errores
y 7 advertencias preexistentes. Revisión independiente de producto, seguridad y
cumplimiento aprobada. La prueba transaccional de escritura temporal en un
perfil real fue rechazada por revisión automática y no se ejecutó. El recorrido
autenticado guardar/recargar sigue pendiente; los tests de parser no lo sustituyen.

Pieza visual producida 2026-10-09: `exec-5aaf0793-5264-4920-9050-981e0a0a8faa.png`.
Objetivo: explicar presentación profesional y enlaces, con colores reales del
repositorio. Texto revisado: «Tu experiencia merece verse. Presenta tu trabajo y
comparte tus enlaces. Conoce EVOLUSA». Lista para compartir aquí; no publicada
externamente y no incluida como asset del producto.
