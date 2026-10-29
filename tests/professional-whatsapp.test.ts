import test from "node:test";
import assert from "node:assert/strict";
import {publicWhatsAppUrl,sanitizeSocialLinks} from "../lib/professional/profile-links.ts";
import {safeSocialLinks} from "../lib/professional/links.ts";
test("public WhatsApp persists and renders only numeric official destination",()=>{
 const good="https://wa.me/13055551234";
 assert.equal(publicWhatsAppUrl(good),good);
 assert.equal(sanitizeSocialLinks({whatsapp:good}).whatsapp,good);
 assert.equal(safeSocialLinks({whatsapp:good}).whatsapp,good);
 for(const bad of ["javascript:alert(1)","http://wa.me/13055551234","https://wa.me.evil.test/13055551234","https://wa.me@evil.test/13055551234","https://evil.test@wa.me/13055551234","https://wa.me/013055551234","https://wa.me/+13055551234","https://wa.me/13055551234?text=private","https://wa.me/13055551234#x","https://wa.me/12","https://wa.me/13055551234/"," https://wa.me/13055551234"]){
 assert.equal(publicWhatsAppUrl(bad),null,bad); assert.equal(sanitizeSocialLinks({whatsapp:bad}).whatsapp,undefined,bad); assert.equal(safeSocialLinks({whatsapp:bad}).whatsapp,undefined,bad);
 }
});
