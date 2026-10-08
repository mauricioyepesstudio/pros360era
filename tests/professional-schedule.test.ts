import test from "node:test";
import assert from "node:assert/strict";
import { emptySchedule, parseProfessionalSchedule, parseBookingUrl, professionalScheduleAllowed, professionalScheduleVersion } from "../lib/professional-schedule/validation.ts";
import {professionalScheduleId} from "../lib/professional-schedule/identity.ts";
import {initialCallId} from "../lib/initial-call/identity.ts";
import {isMemberRoadmapResponse} from "../lib/account/internal-onboarding.ts";
test("paused schedule can preserve an empty week; active needs at least one day",()=>{
 const schedule=emptySchedule();assert.ok(parseProfessionalSchedule(schedule));assert.equal(parseProfessionalSchedule({...schedule,status:"ACTIVE"}),null);
 schedule.days[0].enabled=true;assert.ok(parseProfessionalSchedule({...schedule,status:"ACTIVE"}));
});
test("schedule rejects duplicate/unknown days, invalid zones and backwards or overnight ranges",()=>{
 const s=emptySchedule();s.days[0].enabled=true;
 for(const patch of [{day:"BAD"},{start:"25:00"},{start:"17:00",end:"09:00"},{start:"9:00"},{day:"TUE"}]) {const days=s.days.map((d,i)=>i===0?{...d,...patch}:d);assert.equal(parseProfessionalSchedule({...s,days}),null);}
 assert.equal(parseProfessionalSchedule({...s,timeZone:"bad-zone"}),null);
});
test("schedule cannot inject owner/booking/role and is separate from the member roadmap",()=>{
 for(const k of ["user_id","role","bookingUrl"])assert.equal(parseProfessionalSchedule({...emptySchedule(),[k]:"x"}),null);
 assert.equal(isMemberRoadmapResponse(professionalScheduleVersion),false);
 assert.notEqual(professionalScheduleId("owner"),initialCallId("owner"));
 assert.equal(professionalScheduleId("owner"),professionalScheduleId("owner"));
});
test("professional schedule requires authoritative role AND a professional profile",()=>{
 assert.equal(professionalScheduleAllowed("MEMBER",true),false);assert.equal(professionalScheduleAllowed("ADMIN",false),false);
 assert.equal(professionalScheduleAllowed("PROFESSIONAL",true),true);assert.equal(professionalScheduleAllowed("ADMIN",true),true);assert.equal(professionalScheduleAllowed(null,true),false);
});
test("reservations accept HTTPS without embedded credentials and can be removed",()=>{
 assert.deepEqual(parseBookingUrl(""),{valid:true,url:null});assert.deepEqual(parseBookingUrl(null),{valid:true,url:null});assert.equal(parseBookingUrl("https://cal.com/own-agenda").valid,true);
 for(const v of ["http://cal.com/own","javascript:alert(1)","https://user:password@cal.com/own",42]) assert.equal(parseBookingUrl(v).valid,false);
});
