import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
type Database = {exec(sql:string):Promise<unknown>;query<T=Record<string,unknown>>(sql:string):Promise<{rows:T[]}>;close():Promise<void>};
const {PGlite}=createRequire(import.meta.url)(process.env.EVOLUSA_PGLITE_MODULE||"@electric-sql/pglite") as {PGlite:new()=>Database};
const uid=(n:number)=>"00000000-0000-0000-0000-"+String(n).padStart(12,"0");
const pid=(n:number)=>"20000000-0000-0000-0000-"+String(n).padStart(12,"0");
const aid=(n:number)=>"10000000-0000-0000-0000-"+String(n).padStart(12,"0");
const mig=(f:string)=>fs.readFileSync(new URL("../supabase/migrations/"+f,import.meta.url),"utf8");
test("NOTARY approval requires a VERIFIED notary commission in both admin flows",async t=>{
 const db=new PGlite();t.after(()=>db.close());
 await db.exec(`
 create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create function auth.role() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claim.role',true),'') $$;
 grant usage on schema auth to anon,authenticated,service_role;
 create table public.profiles(id uuid primary key,role text not null);
 create table public.professional_profiles(id uuid primary key,user_id uuid unique,category text,is_approved boolean default false,display_name text default 'Fixture',city text,created_at timestamptz default now());
 create table public.professional_applications(id uuid primary key,email text,category_of_interest text,status text default 'REVIEWED');
 create table public.professional_verifications(id uuid primary key default gen_random_uuid(),professional_profile_id uuid,verification_type text,status text,verified_at timestamptz,
   check (status<>'VERIFIED' or verified_at is not null));
 `);
 for(let n=1;n<=4;n++) await db.exec(`insert into auth.users values ('${uid(n)}','n${n}@example.test',now()); insert into public.profiles values ('${uid(n)}','${n===1?"ADMIN":"PROFESSIONAL"}');`);
 for(const n of [2,3,4]){
  await db.exec(`insert into public.professional_profiles(id,user_id,category) values ('${pid(n)}','${uid(n)}','${n===4?"TAX":"NOTARY"}');
   insert into public.professional_applications values ('${aid(n)}','n${n}@example.test','${n===4?"TAX":"NOTARY"}','REVIEWED');`);
 }
 // n2: commission only PENDING; n3: no verification yet
 await db.exec(`insert into public.professional_verifications(professional_profile_id,verification_type,status) values ('${pid(2)}','NOTARY_COMMISSION_VERIFIED','PENDING')`);
 for(const f of ["20261020205346_admin_professional_profile_approval.sql","20261021144307_admin_existing_profile_approval.sql","20261102130000_admin_existing_profile_document_support.sql","20261103150000_admin_notary_approval_verified_commission.sql"]) await db.exec(mig(f));
 await db.exec("create trigger protect before update on public.professional_profiles for each row execute function public.prevent_professional_profile_protected_field_self_change()");
 const asAdmin=async<T>(run:()=>Promise<T>)=>{await db.exec(`begin; select set_config('request.jwt.claim.sub','${uid(1)}',true),set_config('request.jwt.claim.role','authenticated',true); set local role authenticated;`);try{return await run()}finally{await db.exec("commit")}};
 const app=(n:number)=>db.query<{s:string}>(`select public.admin_approve_application_profile('${aid(n)}') s`).then(r=>r.rows[0].s);
 const existing=(n:number,c="NOTARY")=>db.query<{s:string}>(`select public.admin_approve_existing_profile('${pid(n)}','${c}','Commission checked in FL registry') s`).then(r=>r.rows[0].s);
 const approved=async(n:number)=>(await db.query<{a:boolean}>(`select is_approved a from public.professional_profiles where id='${pid(n)}'`)).rows[0].a;
 await asAdmin(async()=>{
  assert.equal(await app(2),"VERIFICATION_REQUIRED");
  assert.equal(await existing(2),"VERIFICATION_REQUIRED");
  assert.equal(await app(3),"VERIFICATION_REQUIRED");
  assert.equal(await app(4),"CATEGORY_NOT_ENABLED");
  assert.equal(await existing(4,"TAX"),"CATEGORY_NOT_ENABLED");
 });
 assert.equal(await approved(2),false);
 await db.exec(`update public.professional_verifications set status='VERIFIED',verified_at=now() where professional_profile_id='${pid(2)}'`);
 await asAdmin(async()=>{
  const st=await db.query<{approval_state:string}>(`select approval_state from public.admin_application_approval_states() where application_id='${aid(2)}'`);
  assert.equal(st.rows[0].approval_state,"APPROVABLE");
  assert.equal(await app(2),"APPROVED");
  assert.equal(await app(3),"VERIFICATION_REQUIRED");
 });
 assert.equal(await approved(2),true);
 assert.equal(await approved(3),false);
 // a REVOKED commission blocks the existing-profile path for an unapproved notary
 await db.exec(`insert into public.professional_verifications(professional_profile_id,verification_type,status) values ('${pid(3)}','NOTARY_COMMISSION_VERIFIED','REVOKED')`);
 await asAdmin(async()=>assert.equal(await existing(3),"VERIFICATION_REQUIRED"));
});
