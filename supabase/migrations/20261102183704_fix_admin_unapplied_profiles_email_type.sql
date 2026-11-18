-- auth.users.email is varchar while this admin projection declares text.
-- Keep the ADMIN-only boundary intact and normalize only the return type.
create or replace function private.admin_list_unapplied_professional_profiles()
returns table (profile_id uuid,display_name text,email text,category text,city text,created_at timestamptz)
language plpgsql security definer set search_path=''
as $fn$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='ADMIN') then raise exception 'not authorized'; end if;
 return query
 select pp.id,pp.display_name,u.email::text,pp.category,pp.city,pp.created_at
 from public.professional_profiles pp
 join auth.users u on u.id=pp.user_id
 where pp.is_approved=false
   and not exists (
     select 1 from public.professional_applications pa
     where lower(btrim(pa.email))=lower(btrim(u.email))
   )
 order by pp.created_at asc,pp.id asc;
end;
$fn$;
