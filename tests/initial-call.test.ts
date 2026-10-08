import test from "node:test";
import assert from "node:assert/strict";
import { parseInitialCallInput, parseStoredInitialCall, initialCallVersion } from "../lib/initial-call/validation.ts";
import { initialCallDestination, authEntryHref } from "../lib/initial-call/auth-intent.ts";
import { initialCallId, parseCanonicalInitialCallRow } from "../lib/initial-call/identity.ts";
import { isMemberRoadmapResponse, internalOnboardingFilter } from "../lib/account/internal-onboarding.ts";
const input = {preferredName: "Mauricio", topic: "CONOCER_EVOLUSA", availability: "WEEKDAY_AFTERNOON", timeZone: "America/New_York", consent: true};
test("only predefined topics/windows, valid time zones and explicit consent are accepted",()=>{
 assert.ok(parseInitialCallInput(input));
 for(const bad of [{...input,topic:"IMMIGRATION"},{...input,availability:"at 3pm"},{...input,timeZone:"not-a-zone"},{...input,consent:false},null,[]]) assert.equal(parseInitialCallInput(bad),null);
});
test("ownership, email, state and arbitrary details cannot be supplied by the request form",()=>{
 for(const key of ["user_id","email","status","notes","role"]) assert.equal(parseInitialCallInput({...input,[key]:"anything"}),null);
});
test("requested and canceled consent states are distinct; scheduled is not fabricated",()=>{
 assert.ok(parseStoredInitialCall({...input,status:"REQUESTED"}));
 assert.ok(parseStoredInitialCall({...input,status:"CANCELED",consent:false}));
 assert.equal(parseStoredInitialCall({...input,status:"CANCELED"}),null);
 assert.equal(parseStoredInitialCall({...input,status:"CONFIRMED"}),null);
});
test("one stable namespaced UUID per owner makes retries target the same row",()=>{
 const a=initialCallId("b96cae5b-41a4-44c8-a3ee-7343b10080f1");
 assert.equal(a,initialCallId("b96cae5b-41a4-44c8-a3ee-7343b10080f1"));
 assert.notEqual(a,initialCallId("another-owner"));
 assert.match(a,/^[a-f0-9]{8}-[a-f0-9]{4}-8[a-f0-9]{3}-a[a-f0-9]{3}-[a-f0-9]{12}$/);
});
test("confirmation and login preserve professional handoff destination separately from optional call intent",()=>{
 const href=authEntryHref("login","/dashboard/professional",true);const u=new URL(href,"https://evolusa.invalid");
 assert.equal(u.searchParams.get("next"),"/dashboard/professional");assert.equal(u.searchParams.get("initialCall"),"1");
 assert.equal(initialCallDestination(u.searchParams.get("next")!,true),"/videollamada-inicial?returnTo=%2Fdashboard%2Fprofessional");
 assert.equal(initialCallDestination("/dashboard",false),"/dashboard");
 assert.equal(initialCallDestination("//evil.test",false),"/dashboard");
});
test("initial calls and private professional drafts cannot replace member roadmap needs",()=>{
 const rows=[{version:initialCallVersion,needs:[]},{version:"professional-draft-v1",needs:[]},{version:"1.0.0",needs:["BUSINESS"]}];
 assert.deepEqual(rows.filter(r=>isMemberRoadmapResponse(r.version))[0].needs,["BUSINESS"]);
 assert.equal(internalOnboardingFilter,"(professional-draft-v1,initial-call-v1,professional-schedule-v1)");
});

test("admin intake ignores non-canonical shadow rows instead of showing duplicate requests",()=>{
 const user_id="own-user"; const answers={...input,status:"REQUESTED"};
 assert.ok(parseCanonicalInitialCallRow({id:initialCallId(user_id),user_id,answers}));
 assert.equal(parseCanonicalInitialCallRow({id:"arbitrary-shadow-row",user_id,answers}),null);
});

test("preferred name is required, bounded and normalized for human contact",()=>{
 assert.equal(parseInitialCallInput({...input,preferredName:"  Mauricio   Yepes "})?.preferredName,"Mauricio Yepes");
 for(const preferredName of ["", "a", "a".repeat(101),42]) assert.equal(parseInitialCallInput({...input,preferredName}),null);
});
