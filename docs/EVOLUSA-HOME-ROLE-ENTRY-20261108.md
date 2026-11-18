# Inicio por intención — 8 noviembre 2026

Continuación del PR107, sin duplicar PR. Fuente: main remoto00c9516615f14457498eeb5ba0aa4d72e9242143 incorporado sin conflictos a la rama existente, checkout aislado.

El usuario inicia preguntas públicas por /onboarding. El profesional abre /aplicar-profesional para solicitar su perfil, sujeto a revisión. Se reutilizan rutas canónicas, sin crear cuentas ni cambiar permisos, cobros o categorías. Botones de ancho completo en móvil.

La medición de QA del hero toma ambos rectángulos en una evaluación DOM para no mezclar posiciones durante el scroll; conserva límites superior/inferior/horizontal. La comprobación de navegación debe hacer clic en ambos botones y verificar destino; el resto del recorrido público y el error de signup interceptado se conservan. Datos de auth sintéticos solo en el build aislado, sin login Google ni correo real.

Revisión independiente: producto GO / cumplimiento ALLOWED. Pruebas finales, capturas visuales, CI, estado de integración y commit real de producción se registran al cerrar la entrega en la cola central. No se declara aceptación autenticada.
