-- Fix SQLSTATE 42702: RETURNS TABLE exposes "id" as a PL/pgSQL variable.
-- Qualify the existing ADMIN guard; preserve signature, security and ACLs.
create or replace function public.admin_list_professional_applications()
returns table (
  id uuid,
  created_at timestamp with time zone,
  full_name text,
  email text,
  phone text,
  city text,
  category_of_interest text,
  credential_info text,
  bio text,
  notes text,
  status text,
  reviewed_at timestamp with time zone
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not exists (
    select 1 from public.profiles as p
    where p.id = auth.uid() and p.role = 'ADMIN'
  ) then
    raise exception 'not authorized';
  end if;
  return query
    select pa.id, pa.created_at, pa.full_name, pa.email, pa.phone, pa.city,
      pa.category_of_interest, pa.credential_info, pa.bio, pa.notes,
      pa.status, pa.reviewed_at
    from public.professional_applications pa
    order by pa.created_at desc;
end;
$function$;
