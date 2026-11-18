import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
import {evidencePathFor,ownIdentityStatus,validDecisionInput} from "../lib/professional/identity-verification.ts";

const uid=(n:number)=>"00000000-0000-0000-0000-"+String(n).padStart(12,"0");
const pid=(n:number)=>"20000000-0000-0000-0000-"+String(n).padStart(12,"0");

test("evidence file rules and decision input",()=>{
 assert.deepEqual(evidencePathFor(uid(2),{type:"image/png",size:1000},5),{ok:true,path:`${uid(2)}/5.png`});
 assert.equal(evidencePathFor(uid(2),{type:"image/gif",size:1000}).ok,false);
 assert.equal(evidencePathFor(uid(2),{type:"application/pdf",size:6*1024*1024}).ok,false);
 assert.equal(ownIdentityStatus("VERIFIED"),"VERIFIED");
 assert.equal(ownIdentityStatus("anything"),"NONE");
 assert.equal(validDecisionInput(pid(2),"VERIFIED","ID matches account name"),true);
 assert.equal(validDecisionInput(pid(2),"VERIFIED","short"),false);
 assert.equal(validDecisionInput("x","REJECTED","ID matches account name"),false);
});

type Database={exec(sql:string):Promise<unknown>;query<T=Record<string,unknown>>(sql:string):Promise<{rows:T[]}>;close():Promise<void>};
test("approved -> verified requires submitted evidence and an ADMIN decision",async t=>{
 const {PGlite}=createRequire(import.meta.url)(process.env.EVOLUSA_PGLITE_MODULE||"@electric-sql/pglite") as {PGlite:new()=>Database};
 const db=new PGlite();t.after(()=>db.close());
 await db.exec(`
 create role anon; create role authenticated;
 create schema auth; create schema storage;
 create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(bucket_id text,name text);
 alter table storage.objects enable row level security; grant select,insert,delete on storage.objects to authenticated;
 create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name,'/') $$;
 grant usage on schema auth, storage to authenticated;
 create table public.profiles(id uuid primary key,role text not null);
 grant select on public.profiles to authenticated; -- como en Supabase: las políticas de Storage consultan profiles
 create table public.professional_profiles(id uuid primary key,user_id uuid unique,slug text,display_name text,category text,is_approved boolean default false);
 create table public.professional_verifications(id uuid primary key default gen_random_uuid(),professional_profile_id uuid,verification_type text,
   status text default 'PENDING',verified_at timestamptz,internal_notes text,reviewed_by uuid,
   unique(professional_profile_id,verification_type),check (status<>'VERIFIED' or verified_at is not null));
 `);
 for(let n=1;n<=3;n++) await db.exec(`insert into auth.users values ('${uid(n)}','n${n}@example.test'); insert into public.profiles values ('${uid(n)}','${n===1?"ADMIN":"PROFESSIONAL"}');`);
 await db.exec(`insert into public.professional_profiles values ('${pid(2)}','${uid(2)}','p2','P2','BUSINESS_MARKETING',true),('${pid(3)}','${uid(3)}','p3','P3','BUSINESS_MARKETING',false);`);
 await db.exec(fs.readFileSync(new URL("../supabase/migrations/20261116190000_identity_verification_evidence.sql",import.meta.url),"utf8"));
 const as=async<T>(n:number,run:()=>Promise<T>)=>{await db.exec(`begin; select set_config('request.jwt.claim.sub','${uid(n)}',true); set local role authenticated;`);try{return await run()}finally{await db.exec("commit")}};
 const submit=(path:string)=>db.query<{submit_state:string;replaced_path:string|null}>(`select * from public.submit_own_identity_evidence('${path}')`).then(r=>r.rows[0]);
 const decide=(n:number,d:string)=>db.query<{decision_state:string;removed_path:string|null}>(`select * from public.admin_decide_identity_verification('${pid(n)}','${d}','Licencia de FL coincide con el nombre')`).then(r=>r.rows[0]);
 const verifiedPublic=async()=>(await db.query<{s:string}>(`select status s from public.professional_verifications where professional_profile_id='${pid(2)}'`)).rows[0]?.s;

 await as(1,async()=>assert.equal((await decide(2,"VERIFIED")).decision_state,"NO_PENDING_EVIDENCE"));
 await as(3,async()=>assert.equal((await submit(`${uid(3)}/1.png`)).submit_state,"NOT_APPROVED"));
 await as(2,async()=>{
  assert.equal((await submit(`${uid(3)}/1.png`)).submit_state,"INVALID_PATH");
  assert.deepEqual(await submit(`${uid(2)}/1.png`),{submit_state:"SUBMITTED",replaced_path:null});
  assert.deepEqual(await submit(`${uid(2)}/2.png`),{submit_state:"SUBMITTED",replaced_path:`${uid(2)}/1.png`});
  assert.equal((await db.query<{s:string}>("select public.get_own_identity_verification_status() s")).rows[0].s,"PENDING");
 });
 await as(2,async()=>assert.rejects(decide(2,"VERIFIED"),/not authorized/));
 await as(2,async()=>assert.rejects(db.query("select * from public.admin_list_identity_verifications()"),/not authorized/));
 await as(1,async()=>{
  const queue=await db.query<{slug:string;status:string}>("select slug,status from public.admin_list_identity_verifications()");
  assert.deepEqual(queue.rows,[{slug:"p2",status:"PENDING"}]);
  assert.deepEqual(await decide(2,"VERIFIED"),{decision_state:"VERIFIED",removed_path:`${uid(2)}/2.png`});
 });
 assert.equal(await verifiedPublic(),"VERIFIED");
 await as(2,async()=>assert.equal((await submit(`${uid(2)}/3.png`)).submit_state,"ALREADY_VERIFIED"));
 const row=(await db.query<{p:string|null;by:string}>(`select evidence_path p,reviewed_by by from public.professional_verifications where professional_profile_id='${pid(2)}'`)).rows[0];
 assert.deepEqual(row,{p:null,by:uid(1)});
 // Storage borra con DELETE ... WHERE bucket_id/name: sin política SELECT propia el dueño borraba 0 filas.
 const del=(name:string)=>db.query(`delete from storage.objects where bucket_id='verification-evidence' and name='${name}' returning name`).then(r=>r.rows.length);
 await as(3,async()=>{await db.exec(`insert into storage.objects values ('verification-evidence','${uid(3)}/1.png')`);});
 await as(2,async()=>{
  await db.exec(`insert into storage.objects values ('verification-evidence','${uid(2)}/9.png')`);
  assert.equal((await db.query("select name from storage.objects")).rows.length,1);
  assert.equal(await del(`${uid(3)}/1.png`),0);
  assert.equal(await del(`${uid(2)}/9.png`),1);
 });
 await as(1,async()=>assert.equal(await del(`${uid(3)}/1.png`),1));
});
