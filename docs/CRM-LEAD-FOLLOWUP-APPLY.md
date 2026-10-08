# Seguimiento de prospectos — preparado el 2026-10-08

Objetivo: abrir un prospecto propio, cambiar su estado y guardar notas; mantener el borrador cuando otro guardado haga obsoleta la versión cargada. No envía mensajes, no publica contenido, no activa cobros ni modifica consentimiento.

## Alcance exacto de la autorización pendiente

Excepción a la instrucción del owner «No cambies esquema, permisos»: aplicar únicamente `supabase/migrations/20261008192500_crm_lead_followup_v1.sql` al proyecto EvolUSA `ovialqdazxkekvqqgdiu`.

- No crea tablas ni columnas, no modifica registros existentes.
- Permite UPDATE de `crm_leads.status` y `crm_leads.notes` exclusivamente a PROFESSIONAL/ADMIN dueño del registro.
- RLS conserva aislamiento incluso para ADMIN: no acceso global.
- Un trigger modifica `updated_at` en servidor para detectar guardados concurrentes; ningún cliente recibe permiso de escribirlo.
- No permite cambiar propietario, contacto, puntuación, consentimiento o borrar datos.
- Rollback: `supabase/rollback/crm_lead_followup_disable.sql` revoca exclusivamente este UPDATE y elimina su política/trigger/función, preservando datos.

## Aplicación después de aprobación

1. Revisar metadata viva y confirmar ausencia de política/función/trigger de este slice; no aplicar borradores antiguos ni blanket db push.
2. Revisor de seguridad revisa commit exacto + PGlite. CI y Vercel preview deben aprobarse.
3. Aplicar solo el SQL exacto mediante Supabase apply_migration, nombre `crm_lead_followup_v1`, proyecto indicado.
4. Verificar grants por columna, RLS y trigger, ledger. Ningún grant de tabla UPDATE ni de DELETE/TRUNCATE.
5. Integrar el PR aprobado; comprobar commit exacto de producción READY.
6. Prueba autorizada: crear prospecto de prueba etiquetado por owner, abrirlo, guardar estado/notas, recargar y verificar persistencia. Segundo dueño no puede leer/modificarlo; MEMBER no accede. No crear datos ficticios en producción sin autorización específica de prueba.
7. En prueba aislada, cargar dos versiones; segundo guardado retorna409 y conserva borrador. Recarga mantiene borrador, muestra versión guardada, exige guardar manualmente tras revisión.

## Estado

Preparado y revisado; migración NO aplicada. No se afirma funcionamiento de UPDATE en producción mientras siga la congelación de permisos. OAuth/redes aparte: producción no tiene INSTAGRAM_APP_ID/INSTAGRAM_APP_SECRET y no existe persistencia social revisada. No habilitar handlers legacy ni simular cuentas conectadas.
