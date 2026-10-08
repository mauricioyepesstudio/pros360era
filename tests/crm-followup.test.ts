import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { followupInput } from "../lib/crm/followup.ts";

test("follow-up validates status, note size and concurrency token; rejects owner and consent overrides", () => {
  const input = { status: "contacted", notes: "Follow up tomorrow", expectedUpdatedAt: "2026-10-08T19:00:00+00:00" };
  assert.ok(followupInput.safeParse(input).success);
  for (const change of [{ status: "paid" }, { notes: "x".repeat(2001) }, { expectedUpdatedAt: "invalid" }, { user_id: "other" }, { opted_in_email: true }, { qualification_score: 100 }]) assert.ok(!followupInput.safeParse({ ...input, ...change }).success);
});

test("follow-up updates only own status/notes, denies protected columns/other owners/member/anon and detects stale writes", async () => {
  const db = new PGlite();
  const a = "00000000-0000-0000-0000-000000000001", b = "00000000-0000-0000-0000-000000000002", member = "00000000-0000-0000-0000-000000000003";
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
      create table public.profiles(id uuid primary key references auth.users(id),role text not null);
      alter table public.profiles enable row level security; grant select on public.profiles to authenticated;
      create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());`);
    for (const [id, role] of [[a,"PROFESSIONAL"],[b,"ADMIN"],[member,"MEMBER"]]) {
      await db.query("insert into auth.users values($1)",[id]); await db.query("insert into profiles values($1,$2)",[id,role]);
    }
    await db.exec(readFileSync(new URL("../supabase/migrations/20261006184204_crm_manual_capture_v1.sql",import.meta.url),"utf8"));
    await db.exec(readFileSync(new URL("../supabase/migrations/20261008192500_crm_lead_followup_v1.sql",import.meta.url),"utf8"));
    const as = async (role: string, id: string) => { await db.exec("reset role"); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]); await db.exec(`set role ${role}`); };
    await as("authenticated",a);
    const lead = (await db.query<{id:string;stamp:string}>("insert into crm_leads(source,name) values('other','Synthetic only') returning id,updated_at::text as stamp")).rows[0];
    const updated = await db.query<{status:string;notes:string;stamp:string}>("update crm_leads set status='contacted',notes='Call next week' where id=$1 and updated_at=$2::timestamptz returning status,notes,updated_at::text as stamp",[lead.id,lead.stamp]);
    assert.equal(updated.rows.length,1); assert.equal(updated.rows[0].status,"contacted"); assert.notEqual(updated.rows[0].stamp,lead.stamp);
    assert.equal((await db.query("update crm_leads set notes='Stale overwrite' where id=$1 and updated_at=$2::timestamptz returning id",[lead.id,lead.stamp])).rows.length,0);
    for (const sql of ["update crm_leads set user_id=$1", "update crm_leads set qualification_score=100", "update crm_leads set updated_at=now()", "update crm_leads set name='Protected'", "delete from crm_leads"]) await assert.rejects(db.query(sql,sql.includes("$1")?[b]:[]));
    await as("authenticated",b);
    assert.equal((await db.query("update crm_leads set status='lost' where id=$1 returning id",[lead.id])).rows.length,0);
    await db.exec("insert into crm_leads(source,name) values('other','Own admin'); update crm_leads set status='qualified'");
    await as("authenticated",member);
    assert.equal((await db.query("update crm_leads set status='lost' returning id")).rows.length,0);
    await as("anon",""); await assert.rejects(db.query("update crm_leads set status='lost'"));
    await as("authenticated",a);
    assert.equal((await db.query<{notes:string}>("select notes from crm_leads where id=$1",[lead.id])).rows[0].notes,"Call next week");
    await db.exec("reset role");
    await db.exec(readFileSync(new URL("../supabase/rollback/crm_lead_followup_disable.sql",import.meta.url),"utf8"));
    await as("authenticated",a); await assert.rejects(db.query("update crm_leads set status='lost'"));
    assert.equal((await db.query("select * from crm_leads")).rows.length,1);
  } finally { await db.close(); }
});
