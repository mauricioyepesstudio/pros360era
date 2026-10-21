import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
type Database = {exec(sql:string):Promise<unknown>;query<T=Record<string,unknown>>(sql:string):Promise<{rows:T[]}>;close():Promise<void>};
const {PGlite}=createRequire(import.meta.url)(process.env.EVOLUSA_PGLITE_MODULE||"@electric-sql/pglite") as {PGlite:new()=>Database};
const uid=(n:number)=>"00000000-0000-0000-0000-"+String(n).padStart(12,"0");
const aid=(n:number)=>"10000000-0000-0000-0000-"+String(n).padStart(12,"0");
test("approval RPC operates on synthetic PostgreSQL fixtures with real roles and triggers",async t=>{
 const db=new PGlite();t.after(()=>db.close());
 await db.exec(`
 create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create function auth.role() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claim.role',true),'') $$;
 grant usage on schema auth to anon,authenticated,service_role;
 create table public.profiles(id uuid primary key,role text not null);
 create table public.professional_profiles(id uuid primary key,user_id uuid unique,category text,is_approved boolean default false);
 create table public.professional_applications(id uuid primary key,email text,category_of_interest text,status text default 'REVIEWED');
 alter table public.profiles enable row level security;
 create policy profile_self on public.profiles for select to authenticated using(id=auth.uid());
 grant select on public.profiles to authenticated;
 alter table public.professional_profiles enable row level security;
 create policy professional_self on public.professional_profiles for select to authenticated using(user_id=auth.uid());
 grant select on public.professional_profiles to authenticated;
 `);
 for(let n=1;n<=9;n++){
  await db.exec(`insert into auth.users values ('${uid(n)}','fixture${n}@example.test',${n===4?"null":"now()"});
   insert into public.profiles values ('${uid(n)}','${n===1?"ADMIN":n===7?"MEMBER":"PROFESSIONAL"}');`);
 }
 for(const n of [2,4,5,6,7]){
  await db.exec(`insert into public.professional_profiles values ('${uid(n+100)}','${uid(n)}','${n===5?"BUSINESS_OPERATIONS":n===6?"NOTARY":"BUSINESS_MARKETING"}',false)`);
 }
 for(let n=2;n<=9;n++){
  await db.exec(`insert into public.professional_applications values ('${aid(n)}','${n===8?"absent@example.test":n===9?"ambiguous@example.test":"fixture"+n+"@example.test"}','${n===6?"NOTARY":"BUSINESS_MARKETING"}','REVIEWED')`);
 }
 await db.exec(`insert into auth.users values ('${uid(20)}','ambiguous@example.test',now()), ('${uid(21)}','ambiguous@example.test',now())`);
 const migration=fs.readFileSync(new URL("../supabase/migrations/20261020205346_admin_professional_profile_approval.sql",import.meta.url),"utf8");
 await db.exec(migration);
 await db.exec("create trigger protect_professional_profile_fields before update on public.professional_profiles for each row execute function public.prevent_professional_profile_protected_field_self_change()");
 async function actor<T>(role:string,user:string,run:()=>Promise<T>,jwtRole=role){
  await db.exec(`begin; select set_config('request.jwt.claim.sub','${user}',true),set_config('request.jwt.claim.role','${jwtRole}',true); set local role ${role};`);
  try{return await run()}finally{await db.exec("rollback")}
 }
 const approve=(n:number)=>db.query<{state:string}>(`select public.admin_approve_application_profile('${aid(n)}') as state`);
 await t.test("ADMIN approves one existing profile, confirms UPDATE and writes one audit; repeated click is idempotent",async()=>{
  await actor("authenticated",uid(1),async()=>{
   assert.equal((await approve(2)).rows[0].state,"APPROVED");
   assert.equal((await approve(2)).rows[0].state,"APPROVED");
   const states=await db.query<{approval_state:string}>(`select approval_state from public.admin_application_approval_states() where application_id='${aid(2)}'`);
   assert.equal(states.rows[0].approval_state,"APPROVED");
   await db.exec("reset role");
   assert.equal((await db.query<{n:number}>("select count(*)::int as n from private.professional_profile_approval_events")).rows[0].n,1);
   assert.equal((await db.query<{status:string}>(`select status from public.professional_applications where id='${aid(2)}'`)).rows[0].status,"REVIEWED");
  });
 });
 for(const [n,state]of [[3,"NO_PROFILE"],[4,"UNCONFIRMED_EMAIL"],[5,"CATEGORY_MISMATCH"],[6,"CATEGORY_NOT_ENABLED"],[7,"INELIGIBLE_ROLE"],[8,"NO_ACCOUNT"],[9,"AMBIGUOUS_ACCOUNT"],[99,"APPLICATION_NOT_FOUND"]] as const){
  await t.test(state+" rejects approval without creating accounts or changing profiles",async()=>{
   await actor("authenticated",uid(1),async()=>assert.equal((await approve(n)).rows[0].state,state));
  });
 }
 for(const user of [uid(2),uid(7),""]){
  await t.test("non-ADMIN or absent identity cannot read eligibility or approve: "+user,async()=>{
   await assert.rejects(()=>actor("authenticated",user,()=>approve(2)),/not authorized/);
   await assert.rejects(()=>actor("authenticated",user,()=>db.query("select * from public.admin_application_approval_states()")),/not authorized/);
  });
 }
 await t.test("anon cannot EXECUTE wrappers and authenticated cannot read internal helper/audit",async()=>{
  await assert.rejects(()=>actor("anon","",()=>approve(2)),/permission denied/);
  await assert.rejects(()=>actor("authenticated",uid(2),()=>db.query("select * from private.professional_profile_approval_events")),/permission denied/);
  await assert.rejects(()=>actor("authenticated",uid(2),()=>db.query(`select * from private.application_profile_approval_target('${aid(2)}')`)),/permission denied/);
 });
 await t.test("existing table grants do not allow direct self approval",async()=>{
  await assert.rejects(()=>actor("authenticated",uid(2),()=>db.exec(`update public.professional_profiles set is_approved=true where user_id='${uid(2)}'`)),/permission denied/);
 });
 await db.exec("grant update on public.professional_profiles to authenticated; create policy defensive_test_update on public.professional_profiles for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid())");
 await t.test("trigger prevents self approval even if an UPDATE grant/policy is later added",async()=>{
  await assert.rejects(()=>actor("authenticated",uid(2),()=>db.exec(`update public.professional_profiles set is_approved=true where user_id='${uid(2)}'`)),/authorized administrator/);
 });
 await t.test("null auth.role cannot bypass self approval or category protection",async()=>{
  await assert.rejects(()=>actor("authenticated",uid(2),()=>db.exec(`update public.professional_profiles set is_approved=true where user_id='${uid(2)}'`),""),/authorized administrator/);
  await assert.rejects(()=>actor("authenticated",uid(2),()=>db.exec(`update public.professional_profiles set category='NOTARY' where user_id='${uid(2)}'`),""),/authorized operator/);
 });
 await t.test("service category change still resets approval",async()=>{
  await actor("service_role","",async()=>{
   await db.exec("reset role");
   await db.exec(`update public.professional_profiles set is_approved=true where user_id='${uid(2)}'`);
   await db.exec(`update public.professional_profiles set category='BUSINESS_OPERATIONS',is_approved=true where user_id='${uid(2)}'`);
   assert.equal((await db.query<{is_approved:boolean}>(`select is_approved from public.professional_profiles where user_id='${uid(2)}'`)).rows[0].is_approved,false);
  });
 });
 assert.equal((await db.query<{n:number}>("select count(*)::int as n from public.professional_profiles where is_approved")).rows[0].n,0);
 assert.equal((await db.query<{n:number}>("select count(*)::int as n from private.professional_profile_approval_events")).rows[0].n,0);
});
