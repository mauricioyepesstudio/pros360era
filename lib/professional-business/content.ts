import {businessActivity} from "../../data/professional/business-activities.ts";
import type {ProfessionalBusiness} from "./validation.ts";
export type ContentProfile={displayName:string;category:string;slug?:string;websiteUrl?:string|null;business?:ProfessionalBusiness|null};
export function professionalContent(profile:ContentProfile){
 const business=profile.business,activity=business?businessActivity(business.activity):null;
 const brand=business?.businessName||profile.displayName;
 const subject=activity?.topic||(profile.category==="IMMIGRATION_DOCUMENT_SUPPORT"?"organizar tus documentos y preparar preguntas":profile.category==="NOTARY"?"preparar preguntas sobre el trámite notarial":"organizar tu próximo proyecto");
 let website:string|null=null;try{const url=new URL(profile.websiteUrl||"");if(["https:","http:"].includes(url.protocol)&&!url.username&&!url.password)website=url.href;}catch{}
 const cta=website?`Conoce el negocio y solicita información: ${website}`:"Consulta el perfil del profesional y confirma el alcance antes de empezar.";
 const detail=business?`Público: ${business.audience}. Zona de atención: ${business.location}.\nOferta declarada: ${business.offer}.\n`:"";
 return [
  {title:activity?.headline||"Post educativo: prepara tu próximo paso",caption:`En ${brand}, te invitamos a ${subject}.\n${detail}Reúne tus preguntas antes de iniciar una conversación.\n${cta}`},
  {title:activity?`Carrusel: ${activity.label}`:"Carrusel: así puedes preparar tu consulta",caption:`1. Define qué necesitas.\n2. Organiza la información que ya tienes.\n3. Anota tus dudas sobre ${business?.services||"el servicio"}.\n4. Confirma el alcance del servicio antes de empezar.\n${cta}`},
  {title:activity?`Guion para reel: ${activity.label}`:"Guion para reel: una pregunta antes de empezar",caption:`Guion sugerido para ${brand}:\n0–3 s: ¿Qué necesitas para ${subject}?\n3–12 s: Presenta una pregunta frecuente sobre ${business?.services||"tu servicio"}, sin mostrar datos personales.\n12–20 s: Explica el siguiente paso de contacto y el alcance que debe confirmarse.\nCierre: ${cta}`,format:"9x16" as const}
 ];
}
/** Non-security content revision: changes generate new ideas, never rewrite approved posts. */
export function professionalContentRevision(profile:ContentProfile){let hash=2166136261;const text=JSON.stringify([profile.business,profile.websiteUrl,profile.displayName]);for(const char of text){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(36);}
