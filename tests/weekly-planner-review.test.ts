import test from "node:test";import assert from "node:assert/strict";
import{reviewPlannerSave,weekStart,weeklyPlannerSuggestions,pendingWeeklySuggestions,invalidateEditedApprovals}from"../lib/professional-planner/weekly-review.ts";
import{addPlannerSuggestions}from"../lib/professional-planner/suggestions.ts";
test("weekly cycle uses UTC Monday and rejects normalized invalid dates",()=>{assert.equal(weekStart("2026-10-25"),"2026-10-19");assert.equal(weekStart("2026-10-26"),"2026-10-26");assert.throws(()=>weekStart("2026-02-30"));});
const profile={displayName:"Example","category":"IMMIGRATION_DOCUMENT_SUPPORT",slug:"example-abc123"};
test("weekly proposals are scoped, repeatable, new each week; no invented media",()=>{const a=weeklyPlannerSuggestions(profile,"2026-10-21");assert.equal(a.length,3);assert.deepEqual(a,weeklyPlannerSuggestions(profile,"2026-10-23"));assert.notEqual(a[0].id,weeklyPlannerSuggestions({...profile,slug:"other-def456"},"2026-10-21")[0].id);assert.notEqual(a[0].id,weeklyPlannerSuggestions(profile,"2026-10-26")[0].id);assert.equal(a[2].format,"9x16");assert.ok(a.every(s=>s.imageUrl?.startsWith("/api/professional/creative-proposal?")));assert.deepEqual(weeklyPlannerSuggestions(null,"2026-10-21"),[]);});
test("selected proposals are deduplicated ideas and preserve existing posts",()=>{const s=weeklyPlannerSuggestions(profile,"2026-10-21");const posts=addPlannerSuggestions([],s,s.map(x=>x.id),"2026-10-21")!;assert.ok(posts.every(p=>p.status==="IDEA"));assert.equal(posts.find(p=>p.id===s[2].id)?.format,"9x16");assert.equal(pendingWeeklySuggestions(s,posts).length,0);assert.equal(addPlannerSuggestions(posts,s,s.map(x=>x.id),"2026-10-21")!.length,3);assert.equal(pendingWeeklySuggestions(weeklyPlannerSuggestions(profile,"2026-10-26"),posts).length,3);});
test("edited ready payload loses approval; unchanged readiness/history retained",()=>{const s=weeklyPlannerSuggestions(profile,"2026-10-21");const p={...addPlannerSuggestions([],s,[s[0].id],"2026-10-21")![0],status:"READY" as const};assert.equal(invalidateEditedApprovals([p],[{...p,caption:"Changed"}])[0].status,"DRAFT");assert.equal(invalidateEditedApprovals([p],[{...p}])[0].status,"READY");assert.equal(invalidateEditedApprovals([{...p,status:"PUBLISHED"}],[{...p,status:"PUBLISHED"}])[0].status,"PUBLISHED");});

test("saved revision must load and parse before a write may proceed",async()=>{
 const posts=addPlannerSuggestions([],weeklyPlannerSuggestions(profile,"2026-10-21"),[weeklyPlannerSuggestions(profile,"2026-10-21")[0].id],"2026-10-21")!;
 assert.equal((await reviewPlannerSave(posts,async()=>{throw Error("unavailable")})).ok,false);
 assert.equal((await reviewPlannerSave(posts,async()=>({answers:null,exists:false,failed:true}))).ok,false);
 assert.equal((await reviewPlannerSave(posts,async()=>({answers:{posts:"bad"},exists:true,failed:false}))).ok,false);
 const previous={posts:posts.map(p=>({...p,status:"READY"}))};
 const edited=posts.map(p=>({...p,status:"READY" as const,caption:"Changed"}));
 const result=await reviewPlannerSave(edited,async()=>({answers:previous,exists:true,failed:false}));
 assert.equal(result.ok,true);if(result.ok){assert.equal(result.posts[0].status,"DRAFT");assert.equal(result.approvalReset,true);}
 const fresh=await reviewPlannerSave(posts,async()=>({answers:null,exists:false,failed:false}));assert.equal(fresh.ok,true);
});
