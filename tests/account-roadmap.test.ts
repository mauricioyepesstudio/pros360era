import test from "node:test";
import assert from "node:assert/strict";
import { previewProfile } from "../data/account/foundation.ts";
import { generateAccountRoadmap } from "../lib/account/roadmap-engine.ts";
test("completed tasks leave the current queue",()=>{const result=generateAccountRoadmap(previewProfile);assert.equal(result.completed.some(i=>i.id==="define-priority"),true);assert.equal(result.now.some(i=>i.id==="define-priority"),false)});
test("life events affect deterministic recommendations",()=>{const result=generateAccountRoadmap({...previewProfile,selectedNeeds:[],goals:[],lifeEventIds:["organize-taxes"]});assert.equal(result.upcoming.some(i=>i.id==="tax-professional"),true);assert.equal(result.upcoming.find(i=>i.id==="tax-professional")?.sourceType,"PROFESSIONAL")});
