-- EVOLUSA — identidad verificada con evidencia (paso mínimo "aprobado" -> "verificado").
-- PROPUESTA. NO APLICADA. Requiere security-reviewer + OK explícito del owner.
--
-- 0006 creó professional_verifications sin carga de evidencia ni UI: la única vía
-- era SQL manual con service role, por eso hoy hay 7 perfiles aprobados y 0 verificados.
-- Esta migración añade lo mínimo:
--   1. Bucket privado `verification-evidence`: el profesional sube su documento a
--      `<auth.uid()>/...`; solo un ADMIN puede leerlo o borrarlo. Nadie lista ni lee lo ajeno.
--   2. evidence_path / evidence_submitted_at en professional_verifications (tabla
--      que sigue sin ningún grant para anon/authenticated).
--   3. RPC del profesional: enviar evidencia (solo con perfil APROBADO) y leer su estado.
--   4. RPC del ADMIN: cola de revisión y decisión VERIFIED/REJECTED con nota obligatoria.
--      Marcar VERIFIED exige evidencia enviada. Tras decidir, evidence_path queda en null
--      y la app borra el archivo: no se conserva el documento después de revisarlo.
-- Aprobar un perfil sigue sin crear ni tocar verificaciones (y viceversa).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verification-evidence', 'verification-evidence', false, 5242880,
        array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do nothing;

create policy "evidence_owner_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'verification-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "evidence_owner_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'verification-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "evidence_admin_select" on storage.objects for select to authenticated
  using (bucket_id = 'verification-evidence'
         and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'));
create policy "evidence_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'verification-evidence'
         and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN'));

alter table public.professional_verifications
  add column evidence_path text,
  add column evidence_submitted_at timestamptz;

-- Profesional: registra su evidencia. Devuelve estado + ruta anterior (para borrarla).
create or replace function public.submit_own_identity_evidence(p_evidence_path text)
returns table (submit_state text, replaced_path text)
language plpgsql security definer set search_path = ''
as $fn$
declare v_profile uuid; v_approved boolean; v_status text; v_old text;
begin
  if auth.uid() is null then raise exception 'not authorized'; end if;
  if p_evidence_path is null or p_evidence_path not like auth.uid()::text || '/%' or length(p_evidence_path) > 200 then
    return query select 'INVALID_PATH'::text, null::text; return;
  end if;
  select pp.id, pp.is_approved into v_profile, v_approved
  from public.professional_profiles pp where pp.user_id = auth.uid();
  if v_profile is null then return query select 'NO_PROFILE'::text, null::text; return; end if;
  if not v_approved then return query select 'NOT_APPROVED'::text, null::text; return; end if;
  select pv.status, pv.evidence_path into v_status, v_old from public.professional_verifications pv
  where pv.professional_profile_id = v_profile and pv.verification_type = 'IDENTITY_VERIFIED' for update;
  if v_status = 'VERIFIED' then return query select 'ALREADY_VERIFIED'::text, null::text; return; end if;
  insert into public.professional_verifications as pv
    (professional_profile_id, verification_type, status, evidence_path, evidence_submitted_at)
  values (v_profile, 'IDENTITY_VERIFIED', 'PENDING', p_evidence_path, now())
  on conflict (professional_profile_id, verification_type) do update
    set status = 'PENDING', evidence_path = excluded.evidence_path, evidence_submitted_at = now();
  return query select 'SUBMITTED'::text, case when v_old is distinct from p_evidence_path then v_old end;
end;
$fn$;

-- Profesional: solo su estado (nunca notas internas ni quién revisó).
create or replace function public.get_own_identity_verification_status()
returns text language sql stable security definer set search_path = ''
as $fn$
  select coalesce((select case when pv.status = 'PENDING' and pv.evidence_path is null then 'NONE' else pv.status end
    from public.professional_verifications pv join public.professional_profiles pp on pp.id = pv.professional_profile_id
    where pp.user_id = auth.uid() and pv.verification_type = 'IDENTITY_VERIFIED'), 'NONE');
$fn$;

-- ADMIN: perfiles aprobados y su estado de identidad.
create or replace function public.admin_list_identity_verifications()
returns table (profile_id uuid, display_name text, slug text, category text, email text,
               status text, evidence_path text, evidence_submitted_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $fn$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN') then raise exception 'not authorized'; end if;
  return query
  select pp.id, pp.display_name, pp.slug, pp.category, u.email::text,
         coalesce(pv.status, 'NONE'), pv.evidence_path, pv.evidence_submitted_at
  from public.professional_profiles pp
  join auth.users u on u.id = pp.user_id
  left join public.professional_verifications pv
    on pv.professional_profile_id = pp.id and pv.verification_type = 'IDENTITY_VERIFIED'
  where pp.is_approved
  order by (pv.evidence_path is null), pv.evidence_submitted_at, pp.display_name;
end;
$fn$;

-- ADMIN: decide. VERIFIED exige evidencia pendiente. Devuelve la ruta para borrar el archivo.
create or replace function public.admin_decide_identity_verification(p_profile_id uuid, p_decision text, p_notes text)
returns table (decision_state text, removed_path text)
language plpgsql security definer set search_path = ''
as $fn$
declare v_row record;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN') then raise exception 'not authorized'; end if;
  if p_decision not in ('VERIFIED', 'REJECTED') then return query select 'INVALID_DECISION'::text, null::text; return; end if;
  if p_notes is null or length(btrim(p_notes)) < 12 or length(p_notes) > 500 then
    return query select 'NOTES_REQUIRED'::text, null::text; return;
  end if;
  select pv.id, pv.status, pv.evidence_path into v_row from public.professional_verifications pv
  join public.professional_profiles pp on pp.id = pv.professional_profile_id
  where pv.professional_profile_id = p_profile_id and pv.verification_type = 'IDENTITY_VERIFIED' and pp.is_approved
  for update of pv;
  if not found then return query select 'NO_PENDING_EVIDENCE'::text, null::text; return; end if;
  if v_row.status <> 'PENDING' or v_row.evidence_path is null then
    return query select 'NO_PENDING_EVIDENCE'::text, null::text; return;
  end if;
  update public.professional_verifications
    set status = p_decision, verified_at = case when p_decision = 'VERIFIED' then now() else verified_at end,
        reviewed_by = auth.uid(), internal_notes = btrim(p_notes), evidence_path = null
  where id = v_row.id;
  return query select p_decision, v_row.evidence_path;
end;
$fn$;

revoke all on function public.submit_own_identity_evidence(text) from public, anon;
revoke all on function public.get_own_identity_verification_status() from public, anon;
revoke all on function public.admin_list_identity_verifications() from public, anon;
revoke all on function public.admin_decide_identity_verification(uuid, text, text) from public, anon;
grant execute on function public.submit_own_identity_evidence(text) to authenticated;
grant execute on function public.get_own_identity_verification_status() to authenticated;
grant execute on function public.admin_list_identity_verifications() to authenticated;
grant execute on function public.admin_decide_identity_verification(uuid, text, text) to authenticated;
