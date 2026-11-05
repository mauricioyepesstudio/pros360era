import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("test billing SQL protects exemptions, denies client writes and deduplicates events", async () => {
  const db = new PGlite();
  const user = "00000000-0000-0000-0000-000000000101";
  const profile = "00000000-0000-0000-0000-000000000201";
  const exemptUser = "00000000-0000-0000-0000-000000000102";
  const exemptProfile = "00000000-0000-0000-0000-000000000202";
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role;
      create schema auth;
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to authenticated;
      create table auth.users(id uuid primary key);
      create table public.professional_profiles(id uuid primary key);
      create table public.professional_subscriptions(professional_profile_id uuid, billing_exempt boolean);
      grant select on public.professional_subscriptions to service_role;
      insert into auth.users values ('${user}'), ('${exemptUser}');
      insert into public.professional_profiles values ('${profile}'), ('${exemptProfile}');
      insert into public.professional_subscriptions values ('${profile}',false), ('${exemptProfile}',true);
    `);
    await db.exec(readFileSync(new URL("../docs/professional-stripe-test-schema.sql", import.meta.url), "utf8"));
    await db.exec(`
      insert into public.professional_stripe_test_accounts(user_id,professional_profile_id,stripe_customer_id)
      values ('${user}','${profile}','cus_test'), ('${exemptUser}','${exemptProfile}','cus_exempt');
      set role service_role;
    `);
    const record = (event: string, created: number, customer: string, status: string) =>
      db.query("select public.record_professional_stripe_test_event($1,$2,$3,$4,$5,$6,$7)",
        [event, created, customer, "sub_test", "starter", status, "2026-12-01T00:00:00Z"]);
    await assert.rejects(record("evt_exempt", 100, "cus_exempt", "active"), /Exemption protected/);
    await record("evt_one", 100, "cus_test", "active");
    await record("evt_one", 100, "cus_test", "canceled");
    let state = await db.query<{status:string}>("select status from public.professional_stripe_test_accounts where stripe_customer_id='cus_test'");
    assert.equal(state.rows[0].status, "active");
    await record("evt_new", 200, "cus_test", "past_due");
    await record("evt_old", 150, "cus_test", "active");
    state = await db.query<{status:string}>("select status from public.professional_stripe_test_accounts where stripe_customer_id='cus_test'");
    assert.equal(state.rows[0].status, "past_due");
    const exemption = await db.query<{billing_exempt:boolean}>("select billing_exempt from public.professional_subscriptions where professional_profile_id=$1", [exemptProfile]);
    assert.equal(exemption.rows[0].billing_exempt, true);
    await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${user}',false);`);
    const visible = await db.query("select user_id from public.professional_stripe_test_accounts");
    assert.equal(visible.rows.length, 1);
    await assert.rejects(db.exec("update public.professional_stripe_test_accounts set status='active'"), /permission denied/);
    await assert.rejects(record("evt_client", 300, "cus_test", "active"), /permission denied/);
    await db.exec("reset role; set role anon;");
    await assert.rejects(db.exec("select * from public.professional_stripe_test_accounts"), /permission denied/);
  } finally { await db.close(); }
});
