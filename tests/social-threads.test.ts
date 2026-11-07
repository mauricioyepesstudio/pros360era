import test from "node:test";
import assert from "node:assert/strict";
import { getThreadsConfig, threadsAuthorizeUrl, exchangeThreadsCode, fetchThreadsAccount, fetchThreadsGrantedScopes, publishThreadsMedia, ThreadsPublishError } from "../lib/social/threads.ts";
const response = (data: unknown, status=200) => new Response(JSON.stringify(data), {status, headers:{"content-type":"application/json"}});
const config = { appId:"12345678", appSecret:"server-secret", tokenKey:Buffer.alloc(32), redirectUri:"https://example.com/api/social/threads/callback" };
test("Threads needs dedicated server credentials and requests only publishing scopes", () => {
 assert.equal(getThreadsConfig({} as NodeJS.ProcessEnv),null);
 const url = new URL(threadsAuthorizeUrl(config,"signed-state"));
 assert.equal(url.hostname,"www.threads.com"); assert.equal(url.searchParams.get("state"),"signed-state");
 assert.equal(url.searchParams.get("scope"),"threads_basic,threads_content_publish");
});
test("Threads exchanges code, extends token and reads own account with deadlines", async () => {
 const results=[{access_token:"short"},{access_token:"long",expires_in:5184000},{id:"123",username:"owner"}];
 const calls: {url:string,init?:RequestInit}[]=[];
 const fake=(async(url,init)=>{ calls.push({url:String(url),init});return response(results.shift()); }) as typeof fetch;
 const token=await exchangeThreadsCode(config,"safe-code",fake,0);assert.equal(token.accessToken,"long");
 assert.deepEqual(await fetchThreadsAccount(token.accessToken,fake),{id:"123",username:"owner",accountType:"THREADS"});
 assert.ok(calls.every(call=>call.init?.signal));assert.equal(calls[2].init?.headers && (calls[2].init.headers as Record<string,string>).Authorization,"Bearer long");
});
test("Threads creates separately, polls and publishes once; optional permalink failure preserves success", async () => {
 const bodies:RequestInit[]=[];let time=0;const results=[{id:"10"},{status:"IN_PROGRESS"},{status:"FINISHED"},{id:"20"},{}];
 const fake=(async(_url,init)=>{bodies.push(init!);return response(results.shift());}) as typeof fetch;
 const result=await publishThreadsMedia("123","token",{media_type:"IMAGE",image_url:"https://example.com/photo.jpg",text:"Hola",auto_publish_text:"true"},fake,async(ms)=>{time+=ms;},{now:()=>time});
 assert.deepEqual(result,{mediaId:"20",permalink:null});assert.equal(time,60_000);
 assert.equal((bodies[0].body as URLSearchParams).has("auto_publish_text"),false);
 assert.equal(bodies.filter(init=>(init.body as URLSearchParams|undefined)?.has("creation_id")).length,1);
});
test("Threads ambiguous publish stops without retry and reports uncertainty", async () => {
 let calls=0;const fake=(async()=>{calls++;if(calls===3)throw new Error("network");return response(calls===1?{id:"10"}:{status:"FINISHED"});}) as typeof fetch;
 await assert.rejects(publishThreadsMedia("123","token",{media_type:"TEXT",text:"Hola"},fake),error=>error instanceof ThreadsPublishError&&error.publicationUncertain);
 assert.equal(calls,3);
});
test("Threads exhausted deadline, oversize text and invalid format perform no publication", async () => {
 let calls=0;const fake=(async()=>{calls++;return response({id:"10"});}) as typeof fetch;
 await assert.rejects(publishThreadsMedia("123","token",{media_type:"TEXT",text:"Hola"},fake,undefined,{deadline:1,now:()=>2}));
 await assert.rejects(publishThreadsMedia("123","token",{media_type:"TEXT",text:"a".repeat(501)},fake));
 await assert.rejects(publishThreadsMedia("123","token",{media_type:"STORIES"},fake)); assert.equal(calls,0);
});

test("Threads records actual token grants and rejects partial or invalid permissions", async () => {
 const fake = (async () => response({data:{is_valid:true,scopes:["threads_basic","threads_content_publish"]}})) as typeof fetch;
 assert.deepEqual(await fetchThreadsGrantedScopes("token",fake),["threads_basic","threads_content_publish"]);
 for (const data of [{is_valid:true,scopes:["threads_basic"]},{is_valid:false,scopes:["threads_basic","threads_content_publish"]}]) {
  await assert.rejects(fetchThreadsGrantedScopes("token",(async()=>response({data})) as typeof fetch));
 }
});
