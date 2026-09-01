# EVOLUSA — Plantillas de correo de Auth en español

Listas para copiar y pegar en el Dashboard de Supabase: **Authentication → Emails → Templates** (proyecto `ovialqdazxkekvqqgdiu`). Esto es lo que cierra el gap P0-3 de `docs/EVOLUSA-LAUNCH-CHECKLIST.md` — el mailer sigue usando los defaults en inglés de Supabase, y esto los reemplaza.

**No requiere SMTP configurado para funcionar** — estas plantillas se pueden pegar y activar hoy mismo, incluso mientras el mailer por defecto de Supabase (limitado a ~1-2 envíos/hora) sigue activo. El único paso pendiente para volumen real de producción sigue siendo SMTP (ver el bloque al final de este archivo).

Variables de Supabase disponibles: `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .TokenHash }}`, `{{ .SiteURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` (solo en cambio de email). No inventar ninguna otra — estas son las únicas que Supabase realmente sustituye.

**Nota sobre datos de contacto**: `config/brand.ts` todavía tiene teléfono/email/WhatsApp/nombre legal como "Por confirmar". Estas plantillas están escritas para no depender de ningún dato de contacto todavía sin confirmar — no hay ningún placeholder roto ni información inventada. Cuando esos datos existan, se puede añadir una línea de contacto al pie si se desea (no es obligatorio).

---

## 1. Confirmar registro (Confirm signup)

**Subject:**
```
Confirma tu cuenta en EVOLUSA
```

**Body (HTML):**
```html
<h2>Bienvenido a EVOLUSA</h2>
<p>Gracias por registrarte. Confirma tu correo para activar tu cuenta y comenzar a descubrir tu próximo paso.</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi cuenta</a></p>
<p>Si tú no creaste esta cuenta, puedes ignorar este correo.</p>
<p>— El equipo de EVOLUSA</p>
```

## 2. Invitación (Invite user)

**Subject:**
```
Te invitaron a unirte a EVOLUSA
```

**Body (HTML):**
```html
<h2>Tienes una invitación a EVOLUSA</h2>
<p>Alguien te invitó a crear tu cuenta en EVOLUSA, tu camino para avanzar en Estados Unidos.</p>
<p><a href="{{ .ConfirmationURL }}">Aceptar invitación</a></p>
<p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
<p>— El equipo de EVOLUSA</p>
```

## 3. Enlace mágico (Magic Link)

**Subject:**
```
Tu enlace para entrar a EVOLUSA
```

**Body (HTML):**
```html
<h2>Entra a tu cuenta</h2>
<p>Usa este enlace para iniciar sesión en EVOLUSA. El enlace expira pronto y solo funciona una vez.</p>
<p><a href="{{ .ConfirmationURL }}">Iniciar sesión</a></p>
<p>Si tú no solicitaste este enlace, puedes ignorar este correo — tu cuenta sigue segura.</p>
<p>— El equipo de EVOLUSA</p>
```

## 4. Cambio de correo (Change Email Address)

**Subject:**
```
Confirma tu nuevo correo en EVOLUSA
```

**Body (HTML):**
```html
<h2>Confirma tu nuevo correo</h2>
<p>Recibimos una solicitud para cambiar el correo de tu cuenta EVOLUSA a <strong>{{ .NewEmail }}</strong>.</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar cambio de correo</a></p>
<p>Si tú no solicitaste este cambio, ignora este correo y tu cuenta seguirá usando el correo actual.</p>
<p>— El equipo de EVOLUSA</p>
```

## 5. Restablecer contraseña (Reset Password)

**Subject:**
```
Restablece tu contraseña de EVOLUSA
```

**Body (HTML):**
```html
<h2>Restablece tu contraseña</h2>
<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta EVOLUSA.</p>
<p><a href="{{ .ConfirmationURL }}">Crear nueva contraseña</a></p>
<p>Si tú no solicitaste este cambio, ignora este correo — tu contraseña actual sigue siendo válida.</p>
<p>— El equipo de EVOLUSA</p>
```

## 6. Reautenticación (Reauthentication)

**Subject:**
```
Tu código de verificación de EVOLUSA
```

**Body (HTML):**
```html
<h2>Verifica que eres tú</h2>
<p>Usa este código para confirmar una acción sensible en tu cuenta EVOLUSA:</p>
<p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">{{ .Token }}</p>
<p>Si tú no solicitaste este código, ignora este correo.</p>
<p>— El equipo de EVOLUSA</p>
```

---

## Cómo aplicarlas (5 minutos, gratis, sin acceso adicional)

1. Entra a [Supabase Dashboard](https://supabase.com/dashboard/project/ovialqdazxkekvqqgdiu/auth/templates) → Authentication → Emails → Templates.
2. Para cada una de las 6 plantillas, pega el Subject y el Body de arriba.
3. Guarda cada una individualmente (el dashboard no tiene guardado global).
4. Verifica enviándote una prueba (por ejemplo, un registro real con tu propio correo) — sin SMTP configurado, esto sigue limitado a ~1-2 envíos/hora por el mailer por defecto, pero el contenido en español ya funcionará.

## Lo que esto NO resuelve (sigue bloqueado, y sigue costando dinero eventualmente)

El mailer por defecto de Supabase seguirá limitando el volumen real de registros. Para producción real se necesita un proveedor SMTP externo. **Resend tiene un tier gratuito real** (3,000 correos/mes, 100/día, sin tarjeta de crédito) que alcanza perfectamente para un lanzamiento inicial — pero requiere que Mauricio cree la cuenta él mismo (por política, no puedo crear cuentas en su nombre) y verifique un dominio propio para que los correos no lleguen a spam. Ver `docs/EVOLUSA-LAUNCH-CHECKLIST.md` para el resto de la lista.
