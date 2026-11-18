# Ver el perfil guardado desde el editor — 8 noviembre 2026

Fuente: main remoto fc13d8ba800b1017ec814ddaaaf2b1dfcd2793da; checkout aislado. El editor activo /panel-profesional/perfil permite abrir /profesionales/{slug propio} solo cuando el perfil está aprobado. Abre otra pestaña y explica que muestra la información guardada, conservando las ediciones sin guardar en la pestaña del editor.

Es navegación al perfil público existente: no cambia aprobación, visibilidad, identidad verificada, roles, permisos ni campos guardados. Los perfiles pendientes no muestran el enlace. La disponibilidad del destino sigue gobernada por la vista pública y su ruta; el enlace no crea ni publica un perfil.

QA: componente y CSS reales en una ruta local temporal, fixtures sintéticos aprobado/no aprobado con identidad no verificada a375/1440. No se envían formularios; la fixture debe retirarse antes de commit/build final. Script y resultados en C:/AI-OPS/worktrees/evolusa-browser-qa-20261107/profile-preview-20261108.cjs y profile-preview-browser-result-20261108.json. No equivale a una prueba con cuenta profesional real.

Checks, revisión final, PR, integración y commit de producción se registran separadamente en la cola central al cerrar la entrega. Siguen pendientes sesión autorizada y SMTP real; no se modifican configuración ni secretos.
