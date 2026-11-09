# Aceptación autenticada de lectura — 8 noviembre 2026 (Florida)

Fuente main remoto f4f488fb74f3547c8c72bde4de329ade5bf90814. docs/cerebro/agencia.md documenta desde20Oct cuatro secretos E2E existentes; su existencia se volvió a comprobar por nombre y fecha, sin recuperar valores. El navegador conectado no era la única vía disponible. La existencia de secretos no demuestra credenciales válidas ni roles correctos.

## Ejecución manual
Tras revisión, CI e integración en main: `gh workflow run acceptance.yml --repo mauricioyepesstudio/pros360era --ref main`. No cron ni eventos de PR. El job rechaza otras ramas y repositorios, usa contents:read y acciones fijadas a SHA. Playwright1.62.1 se instala aislado antes de inyectar secretos solo al paso de prueba. No se modifican secretos, permisos de cuentas ni proveedores.

## Alcance real
Un intento de contraseña por cuenta en contextos nuevos, sin storage anterior ni service workers. Orígenes fijos de EVOLUSA y su Supabase. MEMBER: login, badge exacto, lectura de perfil y rechazo del área profesional. PRO: solo mauricioyepes01@gmail.com, badge Profesional exacto, editor propio, enlace público cuando esté aprobado, planner y redirección desde dashboard. No se acepta ADMIN como PRO ni se transfieren datos. Un perfil pendiente omite la vista pública y no resuelve esa aceptación.

No guardar formularios, importar onboarding, reservar, publicar, generar con IA ni crear registros. Se bloquean acciones de servidor, API social/CRM y envíos de correo. El login sí crea sesión/auditoría Auth. La sesión de prueba se revoca con /logout?scope=local y el contexto se cierra; no se usa el logout global de la app. Los access JWT pueden seguir siendo válidos hasta expirar, pero no se guardan ni se emiten.

## Evidencia y límites
Solo booleanos, rol enumerado y etapa de fallo en logs/resumen. Sin email, contraseña, nombre, slug, tokens, DOM, capturas, trazas, HAR ni errores crudos. La prueba falla si hay escrituras no autorizadas bloqueadas o falla la limpieza local. `credentials_missing`, `accounts_not_distinct`, `owner_account_mismatch`, login/rol/lector fallido son bloqueos reales: nunca cambian rol, aprobación o contraseña para pasar.

Ocho pruebas de política verifican destinos, verbos, grants, logout local, identidad de PRO y rechazo de emails/signup/recovery. TypeScript, suite completa, lint, build, revisión, PR y resultados de la ejecución real se registran por separado en la cola. Este primer alcance no completa las11 tareas históricas: guardado/recarga, consentimiento Google, SMTP, reservas y publicación siguen fuera.

Referencia primaria: https://supabase.com/docs/guides/auth/signout (consultada8Nov2026). `local` conserva las demás sesiones; no usar global/others.
