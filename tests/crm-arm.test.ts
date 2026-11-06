import test from "node:test";
import assert from "node:assert/strict";
import {armProposal,persistArmDraft,type ArmLead} from "../lib/crm/arm.ts";
const lead:ArmLead={id:"lead-a",user_id:"owner-a",status:"new",updated_at:"2026-10-29T12:00:00Z",notes:"Previous"};
const profile={displayName:"Studio A",category:"BUSINESS_MARKETING",businessName:"Business A",services:"Brand design"};
test("ARM personalizes with versioned business context and restricts regulated claims",()=>{assert.match(armProposal(lead,profile)!.draft,/Business A/);assert.match(armProposal(lead,profile)!.draft,/Brand design/);assert.doesNotMatch(armProposal(lead,{...profile,category:"NOTARY"})!.draft,/Brand design/);assert.notEqual(armProposal(lead,profile)!.key,armProposal(lead,{...profile,services:"New service"})!.key);});
test("ARM rejects another owner before context or writes",async()=>{let touched=false;const out=await persistArmDraft({ownerId:"other",leadId:lead.id,expectedUpdatedAt:lead.updated_at},{readLead:async()=>lead,readProfile:async()=>{touched=true;return profile},save:async()=>{touched=true;return lead}});assert.equal(out.status,404);assert.equal(touched,false);});
test("ARM persists draft once and rejects stale writes",async()=>{
 let row={...lead};let writes=0;
 const deps={readLead:async()=>row,readProfile:async()=>profile,save:async(_lead:ArmLead,ownerId:string,notes:string)=>{assert.equal(ownerId,lead.user_id);writes++;row={...row,notes,updated_at:"2026-10-29T13:00:00Z"};return row}};
 const input={ownerId:lead.user_id,leadId:lead.id,expectedUpdatedAt:lead.updated_at};
 assert.equal((await persistArmDraft({...input,expectedUpdatedAt:"stale"},deps)).status,409);assert.equal(writes,0);
 assert.equal((await persistArmDraft(input,deps)).status,200);assert.match(row.notes!,/BORRADOR, NO ENVIADO/);
 assert.equal((await persistArmDraft(input,deps)).status,200);assert.equal(writes,1);
 row={...row,status:"qualified"};assert.equal((await persistArmDraft(input,deps)).status,409);
});
test("ARM fails closed for missing context, full notes and failed readback",async()=>{
 const input={ownerId:lead.user_id,leadId:lead.id,expectedUpdatedAt:lead.updated_at};
 assert.equal((await persistArmDraft(input,{readLead:async()=>lead,readProfile:async()=>null,save:async()=>{throw Error("never")}})).status,409);
 assert.equal((await persistArmDraft(input,{readLead:async()=>({...lead,notes:"x".repeat(2000)}),readProfile:async()=>profile,save:async()=>{throw Error("never")}})).status,409);
 for(const stored of [null,lead,{...lead,user_id:"other"}])assert.equal((await persistArmDraft(input,{readLead:async()=>lead,readProfile:async()=>profile,save:async()=>stored})).status,409);
});
