import test from "node:test";import assert from "node:assert/strict";import sharp from "sharp";
import {accountMatchesBrand,brandImageUrl,ownPortfolioPhoto,readBrandImage,instagramBrandReference} from "../lib/professional-planner/brand-reference.ts";
const image=await sharp({create:{width:30,height:30,channels:3,background:"#243a6b"}}).png().toBuffer();
test("different declared account never becomes profile branding",()=>{
 assert.equal(accountMatchesBrand("https://instagram.com/rgentertainmentmanagement","evolusa.us"),false);
 assert.equal(accountMatchesBrand("https://www.instagram.com/OneMigration/","onemigration"),true);
 assert.equal(accountMatchesBrand(null,"akma.invest"),true);
 for(const x of ["https://instagram.com.evil.test/onemigration","https://instagram.com/onemigration/extra","http://instagram.com/onemigration"])assert.equal(accountMatchesBrand(x,"onemigration"),false);
});
test("server image URLs reject SSRF targets and arbitrary profile websites",()=>{
 for(const x of ["http://scontent.cdninstagram.com/x","https://127.0.0.1/x","https://cdninstagram.com.evil.test/x","https://x.cdninstagram.com:123/x","https://user:pass@x.cdninstagram.com/x","https://localhost/x","https://mauricio-portfolio-v2.vercel.app/other"])assert.equal(brandImageUrl(x),null);
 assert.ok(brandImageUrl("https://scontent-iad3-1.cdninstagram.com/x"));
 assert.equal(ownPortfolioPhoto("https://mauricio-portfolio-v2.vercel.app/_next/image?url=%2Fimages%2Fmauricio.png&w=1080&q=75"),"https://mauricio-portfolio-v2.vercel.app/images/mauricio.png");
 assert.equal(ownPortfolioPhoto("https://mauricio-portfolio-v2.vercel.app/_next/image?url=http://127.0.0.1"),null);
});
test("bounded images send no bearer token, disallow redirects and invalid types",async()=>{
 let calls=0;const fetcher:typeof fetch=async(_url,init)=>{calls++;assert.equal(init?.redirect,"error");assert.equal(init?.headers,undefined);return new Response(image,{headers:{"content-type":"image/png"}});};
 assert.ok(await readBrandImage("https://scontent.cdninstagram.com/x",fetcher));assert.equal(calls,1);
 assert.equal(await readBrandImage("https://private.test/x",fetcher),null);assert.equal(calls,1);
 assert.equal(await readBrandImage("https://scontent.cdninstagram.com/x",async()=>new Response("<svg/>",{headers:{"content-type":"image/svg+xml"}})),null);
 assert.equal(await readBrandImage("https://scontent.cdninstagram.com/x",async()=>new Response(image,{status:302,headers:{location:"http://127.0.0.1","content-type":"image/png"}})),null);
});
test("chunked response cap does not rely on content length",async()=>{
 let cancelled=false;const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(5_000_001));},cancel(){cancelled=true;}});
 const result=await readBrandImage("https://scontent.cdninstagram.com/x",async()=>new Response(stream,{headers:{"content-type":"image/png"}}));assert.equal(result,null);assert.equal(cancelled,true);
});
test("graph account rechecked; token never follows the CDN image",async()=>{
 const graph:string[]=[];const fetcher:typeof fetch=async(url,init)=>{const u=String(url);
 if(u.startsWith("https://graph.instagram.com/")){assert.equal((init?.headers as Record<string,string>).Authorization,"Bearer test-token");graph.push(u);return Response.json(u.includes("/media?")?{data:[{media_type:"IMAGE",media_url:"https://scontent.cdninstagram.com/media"}]}:{username:"onemigration",profile_picture_url:"https://scontent.cdninstagram.com/avatar"});}
 assert.equal(init?.headers,undefined);return new Response(image,{headers:{"content-type":"image/png"}});};
 const ref=await instagramBrandReference({accountId:"123",username:"onemigration",token:"test-token",version:"v23.0"},fetcher);
 assert.ok(ref?.image);assert.ok(ref?.avatar);assert.ok(ref?.label.includes("@onemigration"));assert.equal(graph.length,2);assert.ok(!JSON.stringify(ref).includes("test-token"));
 const mismatch=await instagramBrandReference({accountId:"123",username:"akma.invest",token:"test-token",version:"v23.0"},async()=>Response.json({username:"onemigration"}));assert.equal(mismatch,null);
});
test("provider failures fail closed to the existing fallback",async()=>{
 assert.equal(await instagramBrandReference({accountId:"../other",username:"akma.invest",token:"x",version:"v23.0"}),null);
 assert.equal(await instagramBrandReference({accountId:"123",username:"akma.invest",token:"x",version:"v23.0"},async()=>{throw Error("provider detail");}),null);
});
