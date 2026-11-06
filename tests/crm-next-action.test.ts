import test from "node:test";
import assert from "node:assert/strict";
import {leadNextAction,appendActionOnce} from "../lib/crm/next-action.ts";
test("next action uses saved state and rejects unknown state or date",()=>{
 const a=leadNextAction({status:"new",updated_at:"2026-10-29T12:00:00Z"})!;
 assert.match(a.title,/primera/);
 assert.equal(leadNextAction({status:"constructor",updated_at:"2026-10-29T12:00:00Z"}),null);
 assert.equal(leadNextAction({status:"new",updated_at:"invalid"}),null);
 const first=appendActionOnce("Existing notes",a)!; assert.match(first,/Existing notes/); assert.equal(appendActionOnce(first,a),first); const afterSave=leadNextAction({status:"new",updated_at:"2026-10-29T13:00:00Z"})!; assert.equal(appendActionOnce(first,afterSave),first); assert.equal(appendActionOnce("x".repeat(2000),a),null);
});
