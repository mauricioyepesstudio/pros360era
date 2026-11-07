# PNG de propuestas: texto y composición

Corrección del 6 de noviembre de 2026. El SVG anterior pedía `Poppins, sans-serif` al rasterizador nativo. La fuente de `next/font` sirve al navegador, pero no garantiza que librsvg encuentre glifos en una función de servidor; se veían cuadros vacíos.

Ahora cada capa de texto usa `sharp` con `text.fontfile` y Poppins Regular/SemiBold incluidas en `assets/fonts/poppins/`, con su licencia OFL original. La ruta falla si falta el archivo. `next.config.ts` incluye expresamente las TTF en el paquete de `/api/professional/creative-proposal`. No se depende de fuentes del sistema, descargas en cada solicitud ni variables de entorno.

Tres composiciones privadas: idea editorial, lista de preparación y referencia/conversación. Solo la tercera puede incorporar una imagen de referencia de la cuenta autenticada; las dos primeras priorizan contenido. Sin referencia propia se usa una figura abstracta, nunca un retrato ajeno. Nombre y actividad proceden del perfil/contexto del propietario; no se insertan datos de Laura, Miguel o Marie por su nombre. Se conserva la paleta canónica para evitar contraste impredecible tomado de una foto.

Seguridad y cumplimiento: misma autorización del endpoint por sesión; no cambia RLS, credenciales, publicación ni aprobación profesional. Texto preparatorio sin asesoramiento individual ni promesas; se conserva BORRADOR PRIVADO · REVISIÓN PENDIENTE. Las imágenes privadas siguen excluidas del publicador social.

Verificación: pruebas de acceso privado, PNG real en ambos formatos, diferencias de glifos W/i (detecta cuadrados idénticos), diferencia Ñ/N, presencia de fuentes en tracing, tres composiciones e identidad por propietario. Inspección visual de seis PNG de prueba de Laura/apoyo documental, Miguel/finanzas y Marie/notaría. Tesseract reconoció nombres, titulares y contenido de los PNG; la instalación inglesa simplifica algunos acentos, comprobados además visualmente y en píxeles. Son fixtures locales de render; no prueban una sesión real ni un despliegue.

Origen de archivos y licencia: https://github.com/google/fonts/tree/main/ofl/poppins (Poppins-Regular.ttf, Poppins-SemiBold.ttf, OFL.txt). No se modifica la fuente ni su licencia.
