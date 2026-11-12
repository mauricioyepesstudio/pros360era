import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { profileInquiryInput, pilotEnabled } from "../lib/inquiries/validation.ts";

const member="00000000-0000-4000-8000-000000000011";
const secondMember="00000000-0000-4000-8000-000000000012";
const owner="00000000-0000-4000-8000-000000000013";
const otherPro="00000000-0000-4000-8000-000000000014";
const marketingId="00000000-0000-4000-8000-000000000015";
const notaryId="00000000-0000-4000-8000-000000000016";
const key=(n:number)=>`11111111-1111-4111-8111-${String(n).padStart(12,"0")}`;

test("inquiry schema forbids cross-tenant overrides, requires explicit consent, and defaults to disabled",()=>{
  const valid={slug:"demo-marketing",idempotencyKey:key(1),name:"Synthetic Buyer",email:"synthetic@example.test",
    phone:"",service:"Diseño de marca",summary:"Quiero mejorar la presentación de mi negocio.",consent:true};
  assert.equal(profileInquiryInput.safeParse(valid).success,true);
  for(const modification of [
    {consent:false},{consent:undefined},{user_id:owner},{professional_user_id:owner},
    {notification_status:"delivered"},{name:""},{email:"not-an-email"},{summary:"short"}
  ]) assert.equal(profileInquiryInput.safeParse({...valid,...modification}).success,false);
  assert.equal(pilotEnabled(),process.env.EVOLUSA_INQUIRY_PILOT_ENABLED==="true");
});

test("DB pilot: one approved owner only, dedup, consent, rate limit, RLS, regulated gate",async()=>{
  const db=new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable
        as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create function auth.jwt() returns jsonb language sql stable
        as $$ select '{"is_anonymous":false}'::jsonb $$;
      grant usage on schema auth to anon,authenticated;
      grant execute on function auth.uid(),auth.jwt() to anon,authenticated;
      create table public.profiles(id uuid primary key references auth.users(id),role text not null);
      alter table public.profiles enable row level security;
      grant select on public.profiles to authenticated;
      create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());
      create table public.professional_profiles(
        id uuid primary key,user_id uuid not null references auth.users(id),slug text unique not null,
        is_approved boolean not null,is_accepting_clients boolean not null,category text not null);
      alter table public.professional_profiles enable row level security;
    `);
    for(const [id,role] of [[member,"MEMBER"],[secondMember,"MEMBER"],[owner,"PROFESSIONAL"],[otherPro,"PROFESSIONAL"]]){
      await db.query("insert into auth.users(id) values($1)",[id]);
      await db.query("insert into profiles(id,role) values($1,$2)",[id,role]);
    }
    await db.query("insert into professional_profiles values($1,$2,$3,true,true,$4)",
      [marketingId,owner,"demo-marketing","BUSINESS_MARKETING"]);
    await db.query("insert into professional_profiles values($1,$2,$3,true,true,$4)",
      [notaryId,otherPro,"demo-notary","NOTARY"]);
    await db.exec(readFileSync(new URL("../supabase/migrations/20261006184204_crm_manual_capture_v1.sql",import.meta.url),"utf8"));
    await db.exec(readFileSync(new URL("../supabase/migrations/20261112183000_crm_profile_inquiry_pilot.sql",import.meta.url),"utf8"));
    const as=async(role:string,id:string)=>{
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);
      await db.exec(`set role ${role}`);
    };
    const submit=(slug:string,uuid:string,consent=true,email="synthetic@example.test")=>db.query<{id:string}>(
      "select public.submit_professional_inquiry($1,$2::uuid,$3,$4,$5,$6,$7,$8) id",
      [slug,uuid,"Synthetic Buyer",email,null,"Branding","Necesito una nueva identidad de marca para mi empresa.",consent]
    );
    await as("authenticated",member);
    await assert.rejects(submit("demo-marketing",key(1),false));
    await assert.rejects(submit("demo-notary",key(1),true));
    const first=(await submit("demo-marketing",key(1))).rows[0].id;
    assert.equal((await submit("demo-marketing",key(1))).rows[0].id,first);
    assert.equal((await db.query("select * from crm_leads")).rows.length,0);
    assert.equal((await db.query("select * from crm_profile_inquiries")).rows.length,0);
    await submit("demo-marketing",key(2));
    await submit("demo-marketing",key(3));
    await assert.rejects(submit("demo-marketing",key(4)));
    await as("authenticated",otherPro);
    assert.equal((await db.query("select * from crm_profile_inquiries")).rows.length,0);
    assert.equal((await db.query("select * from crm_leads")).rows.length,0);
    await as("authenticated",owner);
    assert.equal((await db.query("select * from crm_profile_inquiries")).rows.length,3);
    assert.equal((await db.query("select * from crm_leads")).rows.length,1);
    const stored=(await db.query<{id:string}>("select id from crm_profile_inquiries limit 1")).rows[0].id;
    assert.ok(stored);
    await as("authenticated",secondMember);
    assert.equal((await db.query("select * from crm_leads")).rows.length,0);
    assert.equal((await db.query("select * from crm_profile_inquiries")).rows.length,0);
    await as("anon","");
    await assert.rejects(submit("demo-marketing",key(9)));
    await db.exec("reset role");
    assert.equal((await db.query<{n:number}>("select count(*)::int n from crm_profile_inquiries")).rows[0].n,3);
  } finally { await db.close(); }
});
