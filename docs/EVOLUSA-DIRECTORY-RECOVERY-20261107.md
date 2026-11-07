# Directorio sin coincidencias: siguiente paso

Desde main remoto 41c2554ebc5b6341680f012c55d95da588e4a85b. Cuando la combinación de profesión y etapa no tiene coincidencias, «Ver todos los profesionales» restablece ambos filtros. Solo aparece con filtros activos. «Describir mi necesidad» abre el onboarding canónico. No se cambia el catálogo, aprobación, disponibilidad, roles o acceso público de perfiles.

Prueba aislada del componente real transpilado con hooks y catálogo sintético: categoría y etapa incompatibles → sin perfiles → enlace onboarding presente → restablecer → ambos filtros ALL y lista completa. Sin filtros no muestra botón innecesario. PASS. Harness reproducible WS12: C:/AI-OPS/worktrees/directory-check-20261107.cjs. No es prueba de navegador ni inventario real de profesionales.

Revisión independiente del diff: producto GO, cumplimiento ALLOWED. Resultados finales de suite, TypeScript, lint, build y CI en cola central al cerrar. Estado inicial preparado, no integrado/desplegado. Próximo: aceptación visual del directorio con filtros y lista real autorizada. Sin generación de contenido duplicado ni modificación del planner externo.
