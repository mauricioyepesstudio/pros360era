import { privateCreativeImage } from "./private-creative-url.ts";
import { parseProfessionalPlanner } from "./validation.ts";
import type { PlannerPost } from "./validation.ts";
import type { PlannerSuggestion } from "./suggestions.ts";
type Context={displayName:string;category:string;slug:string};
export function weekStart(today:string):string{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(today))throw Error("Invalid date");
 const d=new Date(today+"T00:00:00Z");
 if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==today)throw Error("Invalid date");
 d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10);
}
/** Editable templates, not generated media or a paid AI call. No cross-account kit assets. */
export function weeklyPlannerSuggestions(profile:Context|null,today:string):PlannerSuggestion[]{
 if(!profile)return[];
 const week=weekStart(today).replaceAll("-","");
 const scope=profile.slug.replace(/[^a-z0-9-]/g,"").slice(-24);if(!scope)return[];
 const regulated=["NOTARY","IMMIGRATION_DOCUMENT_SUPPORT"].includes(profile.category);
 const subject=profile.category==="IMMIGRATION_DOCUMENT_SUPPORT"?"organizar tus documentos y preparar preguntas":profile.category==="NOTARY"?"preparar preguntas sobre el trámite notarial":"organizar tu próximo proyecto";
 const brand=profile.displayName.slice(0,60);
 return [
 {title:"Post educativo: prepara tu próximo paso",caption:`En ${brand}, te invitamos a ${subject}. Reúne tus preguntas y revisa qué información necesitas antes de iniciar una conversación.`},
 {title:"Carrusel: así puedes preparar tu consulta",caption:"1. Define qué necesitas.\n2. Organiza la información que ya tienes.\n3. Anota tus dudas.\n4. Confirma el alcance del servicio antes de empezar."},
 {title:"Guion para reel: una pregunta antes de empezar",caption:`Guion sugerido para ${brand}:\n0–3 s: ¿Qué necesitas organizar antes de dar tu próximo paso?\n3–12 s: Presenta una lista breve de preguntas y documentos, sin mostrar datos personales.\n12–20 s: Invita a consultar el alcance del servicio.\nCierre: Guarda esta lista para preparar tu conversación.`,format:"9x16" as const}
 ].map((item,i)=>({...item,id:`week-${week}-${scope}-brandref3-${i+1}`,imageUrl:privateCreativeImage(i+1,i===2?"9x16":"4x5"),source:"Plantilla editable" as const,note:regulated?"Borrador educativo: revisión humana obligatoria. No determina elegibilidad ni ofrece asesoría legal.":"Define colores, tipografía e imagen de tu marca antes de producir la pieza."}));
}
export function pendingWeeklySuggestions(suggestions:PlannerSuggestion[],posts:PlannerPost[]){
 return suggestions.filter(s=>!posts.some(p=>p.id===s.id));
}
/** Changing a previously approved payload requires a separate approval, never an inherited READY. */
export function invalidateEditedApprovals(previous:PlannerPost[],next:PlannerPost[]):PlannerPost[]{
 const fields=["title","caption","imageUrl","platform","format","date","time"] as const;
 return next.map(post=>{const before=previous.find(p=>p.id===post.id);return before?.status==="READY"&&post.status==="READY"&&fields.some(k=>before[k]!==post[k])?{...post,status:"DRAFT" as const}:post;});
}

/** Fail closed before a write if the owner's saved revision cannot be checked. */
export async function reviewPlannerSave(next:PlannerPost[],load:()=>Promise<{answers:unknown;exists:boolean;failed:boolean}>){
 let previous;
 try{previous=await load();}catch{return {ok:false as const};}
 if(previous.failed)return {ok:false as const};
 const stored=previous.exists?parseProfessionalPlanner(previous.answers):null;
 if(previous.exists&&!stored)return {ok:false as const};
 const posts=invalidateEditedApprovals(stored?.posts??[],next);
 const approvalReset=posts.some(p=>{const before=stored?.posts.find(old=>old.id===p.id);return before?.status==="READY"&&p.status==="DRAFT";});
 return {ok:true as const,posts,approvalReset};
}
