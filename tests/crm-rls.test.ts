import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

// Disposable PostgreSQL engine. Synthetic users only; no network or live Supabase.
test("CRM migration enforces roles, tenant ownership, grants and default consent", async () => {
  const db = new PGlite();
  const ids = { a: "00000000-0000-0000-0000-000000000001", b: "00000000-0000-0000-0000-000000000002", member: "00000000-0000-0000-0000-000000000003", admin: "00000000-0000-0000-0000-000000000004" };
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
      create table public.profiles(id uuid primary key references auth.users(id), role text not null);
      alter table public.profiles enable row level security;
      grant select on public.profiles to authenticated;
      create policy own_profile on public.profiles for select to authenticated using (id = auth.uid());
      alter default privileges in schema public grant all on tables to anon, authenticated;`);
    for (const [name, id] of Object.entries(ids)) {
      await db.query("insert into auth.users values ($1)", [id]);
      await db.query("insert into public.profiles values ($1, $2)", [id, name === "member" ? "MEMBER" : name === "admin" ? "ADMIN" : "PROFESSIONAL"]);
    }
    await db.exec(readFileSync(new URL("../supabase/migrations/20261006184204_crm_manual_capture_v1.sql", import.meta.url), "utf8"));
    const as = async (role: string, id: string) => { await db.exec("reset role"); await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]); await db.exec(`set role ${role}`); };
    const denied = async (sql: string, values: unknown[] = []) => { await assert.rejects(db.query(sql, values)); };
    await as("authenticated", ids.a);
    const lead = await db.query<{ id: string; user_id: string; status: string }>("insert into crm_leads(source,name,email) values ('other','Synthetic A','test@example.invalid') returning id,user_id,status");
    assert.equal(lead.rows[0].user_id, ids.a); assert.equal(lead.rows[0].status, "new");
    const contact = await db.query<{ opted_in_email: boolean; opted_in_whatsapp: boolean; opted_in_sms: boolean }>("insert into crm_contacts(name) values ('Synthetic contact') returning opted_in_email,opted_in_whatsapp,opted_in_sms");
    assert.deepEqual(contact.rows[0], { opted_in_email: false, opted_in_whatsapp: false, opted_in_sms: false });
    for (const table of ["crm_leads", "crm_contacts"]) {
      assert.equal((await db.query(`select * from ${table}`)).rows.length, 1);
      await denied(`update ${table} set user_id = $1`, [ids.b]);
      await denied(`delete from ${table}`); await denied(`truncate ${table}`);
      await denied(`insert into ${table}(user_id,name${table === "crm_leads" ? ",source" : ""}) values ($1,'spoof'${table === "crm_leads" ? ",'other'" : ""})`, [ids.b]);
    }
    await denied("insert into crm_leads(source,name) values ('other','   ')");
    await denied("insert into crm_leads(source,name,status) values ('other','Synthetic','converted')");
    await denied("insert into crm_contacts(name,opted_in_email) values ('Synthetic',true)");
    await denied("insert into crm_leads(source,name,email) values ('other','Duplicate','TEST@example.invalid')");
    await as("authenticated", ids.b);
    for (const table of ["crm_leads", "crm_contacts"]) assert.equal((await db.query(`select * from ${table}`)).rows.length, 0);
    await db.exec("insert into crm_leads(source,name,email) values ('other','Synthetic B','test@example.invalid'); insert into crm_contacts(name) values ('Synthetic B')");
    await as("authenticated", ids.admin);
    assert.equal((await db.query("select * from crm_leads")).rows.length, 0);
    await db.exec("insert into crm_leads(source,name) values ('other','Synthetic admin'); insert into crm_contacts(name) values ('Synthetic admin')");
    await as("authenticated", ids.member);
    for (const table of ["crm_leads", "crm_contacts"]) {
      assert.equal((await db.query(`select * from ${table}`)).rows.length, 0);
      await denied(table === "crm_leads" ? "insert into crm_leads(source,name) values ('other','Member')" : "insert into crm_contacts(name) values ('Member')");
    }
    await as("anon", "");
    for (const table of ["crm_leads", "crm_contacts"]) {
      await denied(`select * from ${table}`);
      await denied(table === "crm_leads" ? "insert into crm_leads(source,name) values ('other','Anon')" : "insert into crm_contacts(name) values ('Anon')");
    }
    await as("authenticated", "");
    assert.equal((await db.query("select * from crm_leads")).rows.length, 0);
    await denied("insert into crm_leads(source,name) values ('other','Missing user')");
    await as("authenticated", ids.a);
    assert.equal((await db.query("select * from crm_leads")).rows.length, 1);
    await db.exec("reset role");
    await db.exec(readFileSync(new URL("../supabase/rollback/crm_manual_capture_disable.sql", import.meta.url), "utf8"));
    await as("authenticated", ids.a);
    for (const table of ["crm_leads", "crm_contacts"]) {
      await denied(`select * from ${table}`);
      await denied(table === "crm_leads" ? "insert into crm_leads(source,name) values ('other','After rollback')" : "insert into crm_contacts(name) values ('After rollback')");
    }
    await db.exec("reset role");
    assert.equal((await db.query("select * from crm_leads")).rows.length, 3);
    assert.equal((await db.query("select * from crm_contacts")).rows.length, 3);
  } finally { await db.close(); }
});
