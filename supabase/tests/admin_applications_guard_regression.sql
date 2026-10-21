-- Read-only live regression; run as an operator with permission to SET ROLE.
-- No users, application rows, approvals or grants are changed.
begin read only;
select set_config('request.jwt.claim.sub',
  (select p.id::text from public.profiles p where p.role = 'ADMIN' limit 1), true);
set local role authenticated;
do $test$
declare actual bigint; expected bigint;
begin
  select count(*) into actual from public.admin_list_professional_applications() a where a.status = 'PENDING';
  select s.pending_applications into expected from public.admin_dashboard_stats() s;
  if actual is distinct from expected then
    raise exception 'Pending list count does not match ADMIN dashboard';
  end if;
end;
$test$;
rollback;

begin read only;
select set_config('request.jwt.claim.sub',
  (select p.id::text from public.profiles p where p.role <> 'ADMIN' limit 1), true);
set local role authenticated;
do $test$
begin
  perform * from public.admin_list_professional_applications();
  raise exception 'TEST_FAILED_NON_ADMIN_ACCEPTED';
exception when raise_exception then
  if sqlerrm <> 'not authorized' then raise; end if;
end;
$test$;
rollback;

begin read only;
select set_config('request.jwt.claim.sub', '', true), set_config('request.jwt.claims', '{}', true);
set local role authenticated;
do $test$
begin
  perform * from public.admin_list_professional_applications();
  raise exception 'TEST_FAILED_MISSING_IDENTITY_ACCEPTED';
exception when raise_exception then
  if sqlerrm <> 'not authorized' then raise; end if;
end;
$test$;
rollback;

begin read only;
set local role anon;
do $test$
begin
  perform * from public.admin_list_professional_applications();
  raise exception 'TEST_FAILED_ANON_ACCEPTED';
exception when insufficient_privilege then null;
end;
$test$;
rollback;
