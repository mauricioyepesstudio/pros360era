import test from "node:test";
import assert from "node:assert/strict";
import {requestProfileApproval,applicationApprovalState} from "../lib/admin/profile-approval.ts";
const id="10000000-0000-0000-0000-000000000001";
test("approval requires a valid application and sends no user, category, role or approval flag",async()=>{
 let received:unknown;
 const r=await requestProfileApproval({rpc:async(...args)=>{received=args;return {data:"APPROVED",error:null}}},id);
 assert.equal(r.saved,true);assert.deepEqual(received,["admin_approve_application_profile",{p_application_id:id}]);
 let calls=0;assert.equal((await requestProfileApproval({rpc:async()=>{calls++;return {data:null,error:null}}},"invalid")).saved,false);assert.equal(calls,0);
});
test("business rejections and unknown responses never report approval",async()=>{
 for(const data of ["CATEGORY_MISMATCH","CATEGORY_NOT_ENABLED","NO_PROFILE","UNCONFIRMED_EMAIL","NO_ACCOUNT","INELIGIBLE_ROLE",null,{},true,"approved"]){
   assert.equal((await requestProfileApproval({rpc:async()=>({data,error:null})},id)).saved,false);
 }
 assert.equal(applicationApprovalState("__proto__"),"UNAVAILABLE");
});
test("RPC and transport failures do not expose raw errors or optimistic approval",async()=>{
 const denied=await requestProfileApproval({rpc:async()=>({data:"APPROVED",error:{message:"private SQL detail"}})},id);
 assert.equal(denied.saved,false);assert.doesNotMatch(denied.message,/private SQL/);
 const network=await requestProfileApproval({rpc:async()=>{throw Error("network")}},id);
 assert.equal(network.saved,false);assert.match(network.message,/confirmar/);
});
