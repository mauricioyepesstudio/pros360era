# LinkedIn y publicación por cuenta

El publicador del planner admite texto, imágenes de kits públicos de EvolUSA y videos MP4 alojados en `/videos/` (máximo 64 MB). Usa Videos API y Posts API, versión 202607: carga multipart con ETags, finalización y procesamiento antes del post. Los archivos se descargan solo del origen de EvolUSA sin redirecciones; no se envían tokens a la descarga del archivo ni a la carga del video. La carga de imágenes de LinkedIn sí exige Bearer.

La conexión actual es de perfil personal (`w_member_social`), no de página empresarial. La página EVOLUSA 146504932 requiere una conexión de organización y permisos específicos de LinkedIn para automatizarse. No se reasigna la conexión personal ni se publica por otra identidad.

Cada pieza de LinkedIn/Threads necesita `publishViaConnection: true` además de READY y fecha/hora. La casilla del editor permite autorizarlo; los antiguos READY que se prepararon para publicar manualmente conservan ese comportamiento. Cambiar cuenta de red desmarca la casilla, y editar un payload aprobado revoca READY por el mecanismo existente.

El registro separado conserva PUBLISHING/PUBLISHED/FAILED. Nunca se reintenta automáticamente un envío incierto. La conexión debe estar activa, sin vencer, con permiso de publicación y pertenecer al dueño del planner. No se crean publicaciones de LinkedIn/Threads a partir de registros de Facebook/Instagram.

Referencias: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/videos-api?view=li-lms-2026-07 y https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-07.
