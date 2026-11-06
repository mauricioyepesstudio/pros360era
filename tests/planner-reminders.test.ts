import test from "node:test";import assert from "node:assert/strict";
import {professionalToday,plannerReminders} from "../lib/professional-planner/reminders.ts";
import type {PlannerPost} from "../lib/professional-planner/validation.ts";
const post:PlannerPost={id:"example",title:"Contenido real",caption:"Borrador",date:"2026-10-28",time:"12:00",platform:"instagram",format:"4x5",imageUrl:null,status:"DRAFT",note:null};
test("planner uses Florida date across UTC midnight and daylight saving",()=>{assert.equal(professionalToday(new Date("2026-10-28T01:00:00Z")),"2026-10-27");assert.equal(professionalToday(new Date("2026-12-01T04:30:00Z")),"2026-11-30")});
test("reminders expose actual approval and connection dependencies without publishing",()=>{
 const original=structuredClone(post),networks={instagram:null,facebook:null};assert.deepEqual(plannerReminders([post],{},networks,"2026-10-27"),[]);assert.equal(plannerReminders([post],{},networks,"2026-10-28")[0].id,"review");
 const ready={...post,status:"READY" as const,imageUrl:"/api/professional/creative-proposal?concept=1&format=4x5"};const alerts=plannerReminders([ready],{},networks,"2026-10-28");assert.ok(alerts.some(alert=>alert.id==="private-images"));assert.ok(alerts.some(alert=>alert.id==="networks"));
 assert.deepEqual(plannerReminders([ready],{example:{state:"PUBLISHED"}},networks,"2026-10-28"),[]);assert.deepEqual(post,original);
 assert.ok(plannerReminders([ready],{example:{state:"FAILED"}},networks,"2026-10-28").some(alert=>alert.id==="failures"));
});

test("profile and connected Instagram identity mismatch is explicit, never a silent switch",()=>{const networks={instagram:{canPublish:true,username:"other-brand"},facebook:null};assert.equal(plannerReminders([],{},networks,"2026-10-28","https://instagram.com/my-brand/")[0].id,"brand-account");assert.deepEqual(plannerReminders([],{},networks,"2026-10-28","https://instagram.com/OTHER-BRAND/"),[]);assert.equal(networks.instagram.username,"other-brand");});
