import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {creativePhotoKey,creativePhotoPaths,loadCreativeMedia} from "../lib/professional-planner/creative-media.ts";
import {creativeSvg,paletteFromCss} from "../lib/professional-planner/private-creative-render.ts";
test("category imagery is deterministic and never a caller-selected path",async()=>{
 assert.equal(creativePhotoKey("IMMIGRATION_DOCUMENT_SUPPORT"),"documents");
 assert.equal(creativePhotoKey("NOTARY"),"documents");
 assert.equal(creativePhotoKey("BUSINESS_MARKETING"),"business");
 assert.equal(creativePhotoKey("../../etc/passwd"),"general");
 for(const key of Object.keys(creativePhotoPaths))assert.ok(creativePhotoPaths[key as keyof typeof creativePhotoPaths].startsWith("public/images/journey/"));
 const m=await loadCreativeMedia("BUSINESS_OPERATIONS");assert.ok(m.photo.byteLength>1000);assert.ok(m.logo.byteLength>1000);
});
test("downloaded art itself labels photo illustrative and keeps own name escaped",()=>{
 const p=paletteFromCss(fs.readFileSync(new URL("../app/globals.css",import.meta.url),"utf8"));
 for(const format of ["4x5","9x16"]as const){const svg=creativeSvg({displayName:"Laura <script>",category:"IMMIGRATION_DOCUMENT_SUPPORT"},1,format,p);
 assert.ok(svg.includes("IMAGEN ILUSTRATIVA"));assert.ok(svg.includes("Laura &lt;script&gt;"));assert.ok(svg.includes("BORRADOR PRIVADO"));assert.ok(!svg.includes("licenciad"));}
});
