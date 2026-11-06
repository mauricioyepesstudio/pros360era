import test from "node:test";import assert from "node:assert/strict";
import {businessActivities} from "../data/professional/business-activities.ts";
import {parseProfessionalBusiness,businessOwnerAllowed,professionalBusinessVersion} from "../lib/professional-business/validation.ts";
import {professionalBusinessId} from "../lib/professional-business/identity.ts";
import {professionalContent,professionalContentRevision} from "../lib/professional-business/content.ts";
import {weeklyPlannerSuggestions} from "../lib/professional-planner/weekly-review.ts";
import {internalOnboardingVersions,isMemberRoadmapResponse} from "../lib/account/internal-onboarding.ts";
const business={activity:"real-estate",businessName:"Negocio de ejemplo",audience:"Familias que comparan viviendas",services:"Acompañamiento en visitas",offer:"Conoce el proceso antes de decidir",location:"Miami, Florida"};
const profile={displayName:"Profesional de ejemplo",category:"BUSINESS_MARKETING",slug:"ejemplo-123456",websiteUrl:"https://example.com",business:parseProfessionalBusiness(business)!};
test("business context is strict, bounded, privately scoped and isolated from member Roadmap",()=>{
 assert.deepEqual(parseProfessionalBusiness(business),business);for(const patch of [{activity:"invalid"},{businessName:""},{offer:"x".repeat(301)},{user_id:"someone-else"},{category:"LEGAL"}])assert.equal(parseProfessionalBusiness({...business,...patch}),null);
 assert.equal(businessOwnerAllowed("MEMBER",true),false);assert.equal(businessOwnerAllowed("PROFESSIONAL",false),false);assert.equal(businessOwnerAllowed("PROFESSIONAL",true),true);
 assert.notEqual(professionalBusinessId("one"),professionalBusinessId("two"));assert.equal(professionalBusinessId("one"),professionalBusinessId("one"));assert.ok(internalOnboardingVersions.includes(professionalBusinessVersion));assert.equal(isMemberRoadmapResponse(professionalBusinessVersion),false);
});
test("each requested activity changes proposed content without enabling professional categories",()=>{
 for(const activity of businessActivities){const context={...profile,business:{...profile.business,activity:activity.id}};const proposals=weeklyPlannerSuggestions(context,"2026-10-28");assert.equal(proposals.length,3);assert.equal(proposals[0].title,activity.headline);assert.match(proposals[0].caption,/Familias/);assert.match(proposals[0].caption,/https:\/\/example.com/);assert.ok(proposals.every(proposal=>proposal.id.length<=64));}
 assert.notEqual(professionalContent(profile)[0].title,professionalContent({...profile,business:{...profile.business,activity:"auto-sales"}})[0].title);
});
test("changing the business produces fresh ideas; existing ready or published history is not mutated",()=>{
 const before=weeklyPlannerSuggestions(profile,"2026-10-28"),copy=structuredClone(before);const changed={...profile,business:{...profile.business,offer:"Nueva oferta real"}};
 assert.notEqual(professionalContentRevision(profile),professionalContentRevision(changed));assert.notEqual(before[0].id,weeklyPlannerSuggestions(changed,"2026-10-28")[0].id);assert.deepEqual(before,copy);
 assert.doesNotMatch(professionalContent({...profile,websiteUrl:"https://user:password@example.com"})[0].caption,/user:password/);
});
