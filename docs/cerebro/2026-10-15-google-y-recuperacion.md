# EVOLUSA — Google y recuperación de contraseña, 2026-10-15

## Qué encontré en el Supabase vivo (`ovialqdazxkekvqqgdiu`, solo lectura)

- **Google está apagado.** El 14-oct a las 18:57 UTC un intento real de "Continuar con Google" devolvió `400 provider is not enabled`. `auth.identities` solo tiene el proveedor `email` (6 cuentas).
- **La URL del sitio de Supabase apunta a `http://localhost:3000`** (inferido: es el `referer` que Auth registra en todas las peticiones, incluidas las que no traen redirección). Cuando un enlace pide volver a una URL que no está en la lista permitida, Supabase lo manda a esa URL del sitio, es decir, a localhost. Por eso los correos de confirmación y recuperación no llevaban a la web.
- **Ningún correo de recuperación ha salido.** Hubo 3 solicitudes (`POST /recover`, 14 y 15-oct, respuesta 200), pero `recovery_sent_at` está vacío en las 7 cuentas. Los registros del 13-oct ya mostraban a Resend rechazando con 550 los envíos a destinatarios externos (dominio sin verificar).

## Qué cambia el código (esta rama)

- Registro, reenvío de confirmación, Google y recuperación piden volver a `https://<este sitio>/auth/callback?next=…`, nunca a la URL del sitio de Supabase.
- `/auth/callback` canjea el código en el servidor; si el enlace de recuperación falló o expiró, lleva a `/forgot-password?error=expired` con un aviso claro; los demás fallos van a `/login` con un mensaje en español.
- Nueva ruta `/auth/confirm` (token_hash) para que el enlace funcione aunque se abra en otro teléfono o navegador, si se ajusta la plantilla de correo (paso 4).
- `/forgot-password` muestra el motivo real si Supabase rechaza el envío (por ejemplo, límite de correos).
- Incluye los ajustes de PR #55 (entrada única "Ya tengo cuenta", sin `\n` literal, sin llamada genérica, Google solo visible como activo cuando Supabase lo tiene encendido).

## Lo que solo puede hacer el dueño (cuentas y credenciales)

1. **Supabase → Authentication → URL Configuration**
   - Site URL: `https://evolusa.vercel.app`
   - Redirect URLs: añadir `https://evolusa.vercel.app/**` y `https://*-mauricioyepesstudios-projects.vercel.app/**` (vistas previas; ajustar al equipo real de Vercel) y `http://localhost:3002/**`.
2. **Google Cloud Console → APIs y servicios → Credenciales → Crear ID de cliente OAuth (Aplicación web)**
   - Orígenes autorizados: `https://evolusa.vercel.app`
   - URI de redirección autorizado: `https://ovialqdazxkekvqqgdiu.supabase.co/auth/v1/callback`
   - Pantalla de consentimiento: nombre EVOLUSA, correo de soporte, enlaces `https://evolusa.vercel.app/privacidad` y `/terminos`; publicar la app (o añadir usuarios de prueba).
3. **Supabase → Authentication → Sign In / Providers → Google**: activar, pegar Client ID y Client Secret, guardar. Al recargar `/login`, el botón pasa solo a "Continuar con Google".
4. **Correo (SMTP) — Supabase → Authentication → Emails → SMTP Settings.** Elegir una:
   - Resend con un dominio propio verificado (registros DNS SPF/DKIM en Resend) y remitente `no-reply@<dominio>`. Hoy rechaza (550) porque no hay dominio verificado.
   - Gmail con contraseña de aplicación: host `smtp.gmail.com`, puerto 465, usuario el Gmail, contraseña de aplicación de 16 caracteres (requiere verificación en 2 pasos).
   - Opcional, recomendado: en **Emails → Templates → Reset Password**, cambiar el enlace por `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery` para que funcione desde cualquier dispositivo.
5. Probar: `/forgot-password` con un correo real → llega el correo → el enlace abre `/reset-password` → guardar → entrar con la nueva contraseña. Y `/login` → Continuar con Google → vuelve al panel.

No se cambió ninguna configuración, secreto, rol, esquema ni dato.
