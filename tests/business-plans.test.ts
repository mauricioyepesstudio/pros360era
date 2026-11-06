import test from "node:test";import assert from "node:assert/strict";
import {businessPlans,businessCostLayers,businessPlanSources,businessPlanQuoteUrl}from "../data/professional/business-plans.ts";
import {services}from "../data/services/services.ts";
test("business plans reference canonical catalog and never invent prices",()=>{
 assert.equal(businessPlans.length,3);assert.equal(new Set(businessPlans.map(p=>p.id)).size,3);
 for(const p of businessPlans){assert.equal(p.priceMode,"quote");assert.ok(p.activation.length>30);for(const id of p.serviceIds)assert.ok(services.some(s=>s.id===id),id);}
 assert.deepEqual(businessCostLayers.map(c=>c.id),["implementation","management","external"]);
});
test("assisted WhatsApp offering does not enable the automation product",()=>{
 const wa=services.find(s=>s.id==="whatsapp-business-support");assert.ok(wa);assert.equal(wa.category,"MARKETING");assert.equal(wa.fulfillmentType,"DIRECT");
 assert.ok(wa.description.includes("asistida"));assert.equal(services.find(s=>s.id==="growth-automation")?.enabled,false);
 assert.ok(businessPlans[2].activation.includes("no están activadas"));assert.ok(businessPlans[2].deliverables.join(" ").includes("sin garantizar"));
 for(const x of businessPlanSources)assert.ok(x.href.startsWith("https://"));
});

test("quote link preserves chosen plan without sending a message",()=>{for(const plan of businessPlans){const u=new URL(businessPlanQuoteUrl("https://wa.me/17866041733",plan));assert.equal(u.origin,"https://wa.me");assert.ok(u.searchParams.get("text")?.includes(plan.id));assert.ok(u.searchParams.get("text")?.includes(plan.name));}assert.throws(()=>businessPlanQuoteUrl("http://evil.test",businessPlans[0]));});
