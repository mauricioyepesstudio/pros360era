import {createHash} from "node:crypto";
import {leadNextAction} from "./next-action.ts";
export type ArmLead={id:string;user_id:string;status:string;notes:string|null;updated_at:string};
export type ArmProfile={displayName:string;category:string;businessName?:string;services?:string};
export function armProposal(lead:ArmLead,profile:ArmProfile){
 const base=leadNextAction(lead);if(!base)return null;
 const revision=createHash("sha256").update(JSON.stringify(profile)).digest("hex").slice(0,16);
 const regulated=!["BUSINESS_MARKETING","BUSINESS_OPERATIONS"].includes(profile.category);
 const detail=regulated?"Confirma el alcance permitido con el profesional; no ofrece asesoria ni verifica habilitacion.":profile.services?"Servicios declarados: "+profile.services.slice(0,300)+".":"Confirma el servicio que necesitas.";
 return {key:"arm-v1:"+lead.id+":"+lead.status+":"+revision,title:base.title,state:"draft" as const,draft:"Equipo de "+(profile.businessName||profile.displayName)+": "+base.draft+"\n"+detail,delivery:"not_sent" as const};
}
export async function persistArmDraft(input:{ownerId:string;leadId:string;expectedUpdatedAt:string},deps:{
 readLead:(id:string,ownerId:string)=>Promise<ArmLead|null>;
 readProfile:()=>Promise<ArmProfile|null>;
 save:(lead:ArmLead,ownerId:string,notes:string)=>Promise<ArmLead|null>;
}){
 const lead=await deps.readLead(input.leadId,input.ownerId);
 if(!lead||lead.user_id!==input.ownerId)return {status:404,error:"Prospecto no encontrado."};
 const profile=await deps.readProfile();if(!profile)return {status:409,error:"Completa tu perfil y negocio antes de preparar el seguimiento."};
 const proposal=armProposal(lead,profile);if(!proposal)return {status:409,error:"El estado no permite preparar esta accion."};
 const marker="[ARM "+proposal.key+"]";
 if((lead.notes||"").includes(marker))return {status:200,lead,proposal,alreadyPrepared:true};
 if(lead.updated_at!==input.expectedUpdatedAt)return {status:409,error:"El prospecto cambio. Recarga antes de preparar la accion."};
 const notes=((lead.notes||"").trim()?lead.notes!.trim()+"\n\n":"")+marker+"\nEstado: BORRADOR, NO ENVIADO\n"+proposal.draft;
 if(notes.length>2000)return {status:409,error:"Reduce las notas antes de agregar el borrador ARM."};
 const stored=await deps.save(lead,input.ownerId,notes);
 if(!stored||stored.id!==lead.id||stored.user_id!==input.ownerId||stored.notes!==notes)return {status:409,error:"El prospecto cambio. Recarga antes de preparar la accion."};
 return {status:200,lead:stored,proposal,alreadyPrepared:false};
}
