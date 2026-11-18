# Planner: un borrador con voz propia

Reconciliación de PR52 con main remoto 67480c6251c3a3ff656b5af6181fd15da66d56f0. Se conservan el planner y el importador actuales; las notas del 13 de octubre son históricas.

«Generar un borrador» pide una sola propuesta mediante draftWithMyVoice. Requiere sesión, perfil propio, voz y negocio guardados. Errores de preparación/proveedor se muestran sin texto inventado. Un resultado blocked o needs_review no se agrega a las sugerencias. El borrador aceptado sigue siendo editable: solo una selección y guardado explícitos lo añaden como IDEA. No genera imágenes, aprueba, programa ni publica. No instala proveedores ni activa claves/cuota.

Prueba aislada del action real transpilado con proveedor sustituido: tema inválido sin llamada; errores de preparación/proveedor; blocked y needs_review rechazados; ok devuelve una propuesta, una llamada por intento, caption y hashtags. Siete escenarios PASS, incluidos caption y hashtags excesivos. Harness WS12: C:/AI-OPS/worktrees/pr52-action-check-20261106.cjs. Suite 374/374 y TypeScript PASS; lint sin errores y cinco advertencias previas. Build y diff-check PASS. Revisión final independiente producto GO/cumplimiento ALLOWED tras corregir longitud y etiqueta del borrador.

Pendiente aceptación de navegador con propietario autorizado; ninguna llamada real de IA ni publicación en esta validación. No se afirma login Google, entrega SMTP o recorrido Laura/Marie. Material creativo existente conservado; no se duplica producción de videos ni se modifica planner de Mauricio sin leer su versión actual.
