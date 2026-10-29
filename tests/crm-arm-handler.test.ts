import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import ts from "typescript";
import {persistArmDraft} from "../lib/crm/arm.ts";
const require=createRequire(import.meta.url);
const code=ts.transpileModule(readFileSync(new URL("../app/api/crm/leads/[id]/route.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const uuid="00000000-0000-4000-8000-000000000001";
function handler(access:unknown){
 const loaded={exports:{} as Record<string,(request: Request, context: {params: Promise<{id:string}>}) => Promise<Response>>};
 const lookup=(name:string)=>{
  if(name==="next/server")return {NextResponse:{json:(value:unknown,options?:ResponseInit)=>Response.json(value,options)}};
  if(name==="@/lib/crm/access")return {getCRMAccess:async()=>access};
  if(name==="@/lib/crm/arm")return {persistArmDraft};
  if(name==="@/lib/crm/followup")return require("../lib/crm/followup.ts");
  if(name==="@/lib/professional/self-profile")return {getMyProfessionalProfile:async()=>{throw Error("must not access another profile")}};
  if(name==="@/lib/professional-business/persistence")return {getMyProfessionalBusiness:async()=>{throw Error("must not access another profile")}};
  return require(name);
 };
 new Function("require","module","exports",code)(lookup,loaded,loaded.exports);
 return loaded.exports.POST;
}
const request=(body:unknown)=>new Request("http://localhost/api/crm/leads/"+uuid,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
test("real ARM POST preserves unauthenticated/member access responses",async()=>{
 for(const status of [401,403]){const post=handler({response:Response.json({error:"denied"},{status})});const result=await post(request({}),{params:Promise.resolve({id:uuid})});assert.equal(result.status,status);}
});
test("real ARM POST rejects malformed input before database access",async()=>{
 const post=handler({user:{id:"owner"},supabase:{from:()=>{throw Error("must not query")}}});
 for(const body of [{},{expectedUpdatedAt:"bad"},{expectedUpdatedAt:"2026-10-29T12:00:00Z",ownerId:"other"}]){
 const result=await post(request(body),{params:Promise.resolve({id:uuid})});assert.equal(result.status,400);
 }
});
test("real ARM POST filters other-owner records and fails closed on database failure",async()=>{
 for(const fail of [false,true]){
 const filters:unknown[]=[];const query={select:()=>query,eq:(...args:unknown[])=>{filters.push(args);return query},maybeSingle:async()=>({data:null,error:fail?Error("unavailable"):null})};
 const post=handler({user:{id:"owner"},supabase:{from:()=>query}});
 const result=await post(request({expectedUpdatedAt:"2026-10-29T12:00:00Z"}),{params:Promise.resolve({id:uuid})});
 assert.equal(result.status,fail?503:404);assert.deepEqual(filters,[["id",uuid],["user_id","owner"]]);
 }
});
