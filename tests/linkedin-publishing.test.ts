import test from "node:test";
import assert from "node:assert/strict";
import { linkedInMediaUrl, publishLinkedInPost, LinkedInPublishError } from "../lib/social/linkedin-publishing.ts";
import { linkedInRequest, threadsRequest, duePosts } from "../lib/professional-planner/publishing.ts";
import type { PlannerPost } from "../lib/professional-planner/validation.ts";
const post: PlannerPost = { id: "li-video", publishViaConnection: true, platform: "linkedin", format: "reel", title: "EvolUSA", caption: "Tu próximo paso", imageUrl: "/videos/usuario-9x16.mp4", date: "2026-11-05", time: "12:00", status: "READY", note: null };

test("both additional networks participate in scheduling and retain duplicate suppression", () => {
  const threads = { ...post, id: "th-video", platform: "threads" as const };
  assert.equal(duePosts({posts:[post,threads]}, {}, Date.parse("2026-11-05T17:01Z")).length, 2);
  assert.equal(duePosts({posts:[post]}, {[post.id]:{state:"PUBLISHED",scheduledFor:"2026-11-05T17:00:00.000Z",at:"2026-11-05T17:01:00Z",mediaId:"123",permalink:null,error:null}}, Date.parse("2026-11-05T17:01Z")).length, 0);
  assert.equal(duePosts({posts:[{...post,publishViaConnection:undefined}]}, {}, Date.parse("2026-11-05T17:01Z")).length, 0, "legacy manually-ready posts must not become automatic on release");
  assert.equal(threadsRequest({...threads, caption:"x".repeat(501)}, "https://evolusa.vercel.app").ok, false);
  assert.equal(linkedInRequest({...post,imageUrl:null}, "https://evolusa.vercel.app").ok, false);
});
test("LinkedIn downloads only trusted public assets and rejects credential URLs", () => {
  assert.equal(linkedInMediaUrl(post.imageUrl!).origin, "https://www.evolusa.us");
  for (const bad of ["https://127.0.0.1/a.mp4", "https://x.com/a.mp4", "https://user:pass@evolusa.vercel.app/videos/a.mp4", "/api/private", "/videos/a.mp4?x=1"]) assert.throws(() => linkedInMediaUrl(bad));
});
test("LinkedIn uploads every instructed part, finalizes, checks processing, then creates exactly one post", async () => {
  const requests: string[] = []; let count = 0;
  const fake = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input); requests.push(url);
    if (url.includes("/videos/usuario")) return new Response(Buffer.from("abcdefgh"));
    if (url.endsWith("initializeUpload")) return Response.json({value:{video:"urn:li:video:abc",uploadToken:"",uploadInstructions:[{firstByte:0,lastByte:3,uploadUrl:"https://www.linkedin.com/upload/one"},{firstByte:4,lastByte:7,uploadUrl:"https://www.linkedin.com/upload/two"}]}});
    if (url.includes("/upload/")) { assert.equal((init!.body as Buffer).length,4); assert.equal(new Headers(init?.headers).has("authorization"),false); return new Response("",{headers:{etag:'"part"'}}); }
    if (url.endsWith("finalizeUpload")) { const body=JSON.parse(String(init!.body)); assert.deepEqual(body.finalizeUploadRequest.uploadedPartIds,["part","part"]);return Response.json({}); }
    if (url.includes("videos/urn")) return Response.json({status:++count===1?"PROCESSING":"AVAILABLE"});
    assert.match(String(init!.body),/urn:li:person:member/);
    return new Response("", {status:201,headers:{"x-restli-id":"urn:li:share:123"}});
  }) as typeof fetch;
  const result = await publishLinkedInPost("member","secret",{kind:"VIDEO",mediaUrl:post.imageUrl,caption:post.caption,title:post.title},fake,async()=>{});
  assert.equal(result.mediaId,"urn:li:share:123");
  assert.equal(requests.filter(url=>url.endsWith("/posts")).length,1);
});
test("a timed-out create is uncertain and never retried",async()=>{
  let calls=0;
  const fake=(async()=>{calls++;throw new Error("timeout");}) as typeof fetch;
  await assert.rejects(publishLinkedInPost("member","t",{kind:"TEXT",caption:"Hola",title:"",mediaUrl:null},fake), error=>error instanceof LinkedInPublishError&&error.publicationUncertain);
  assert.equal(calls,1);
});
test("expired execution budget cannot start a publication",async()=>{
  const fake=(async()=>{throw new Error("must not fetch");}) as typeof fetch;
  await assert.rejects(publishLinkedInPost("member","t",{kind:"TEXT",caption:"Hola",title:"",mediaUrl:null},fake,async()=>{},{now:()=>2,deadline:1}),/agotó/);
});

test("image uploads authenticate to LinkedIn while video uploads stay token-free", async () => {
  let uploaded=false;
  const fake=(async(input:string|URL,init?:RequestInit)=>{
    const url=String(input);
    if(url.includes("/professionals/"))return new Response(Buffer.from("img"),{headers:{"content-type":"image/jpeg"}});
    if(url.includes("initializeUpload"))return Response.json({value:{image:"urn:li:image:abc",uploadUrl:"https://www.linkedin.com/upload/image"}});
    if(url.includes("/upload/")){uploaded=true;assert.equal(new Headers(init?.headers).get("authorization"),"Bearer secret");return new Response("");}
    return new Response("",{status:201,headers:{"x-restli-id":"urn:li:share:123"}});
  }) as typeof fetch;
  await publishLinkedInPost("member","secret",{kind:"IMAGE",caption:"Hola",title:"",mediaUrl:"/professionals/kits/test/image.jpg"},fake);
  assert.equal(uploaded,true);
});

test("LinkedIn accepts EVOLUSA's old domains but always downloads from www.evolusa.us", () => {
  for (const old of ["https://evolusa.vercel.app/videos/a.mp4", "https://evolusa.us/videos/a.mp4", "/videos/a.mp4"]) {
    assert.equal(linkedInMediaUrl(old).href, "https://www.evolusa.us/videos/a.mp4");
  }
  assert.throws(() => linkedInMediaUrl("https://evolusa.us.evil.example/videos/a.mp4"));
});
