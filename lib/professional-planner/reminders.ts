import type {PlannerPost} from "./validation.ts";
import {isPrivateCreativeImage} from "./private-creative-url.ts";
type Publication={state:string};
type Networks={instagram:{canPublish:boolean;username?:string}|null;facebook:{canPublish:boolean;username?:string}|null};
export function professionalToday(now=new Date()){
 const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
 const part=(key:string)=>parts.find(value=>value.type===key)?.value;
 return `${part("year")}-${part("month")}-${part("day")}`;
}
export function plannerReminders(posts:PlannerPost[],publications:Record<string,Publication>,networks:Networks,today:string,declaredInstagram?:string|null){
 const alerts:{id:string;message:string;href:string}[]=[];
 let declared:string|null=null;
 try{const url=new URL(declaredInstagram||"");const parts=url.pathname.split("/").filter(Boolean);if(["instagram.com","www.instagram.com"].includes(url.hostname)&&parts.length===1&&!url.username&&!url.password)declared=parts[0];}catch{}
 if(declared&&networks.instagram?.username&&declared.toLowerCase()!==networks.instagram.username.toLowerCase())alerts.push({id:"brand-account",message:`Tu perfil enlaza a @${declared}, pero el planner publica con @${networks.instagram.username}. Confirma qué cuenta corresponde a este negocio.`,href:"/panel-profesional/redes"});
 const failed=posts.filter(post=>["FAILED","MISSED"].includes(publications[post.id]?.state));
 if(failed.length)alerts.push({id:"failures",message:`${failed.length} publicaciones necesitan revisión: fallaron o pasó su horario sin publicarse.`,href:"/panel-profesional/planner"});
 const pending=posts.filter(post=>post.date&&post.date<=today&&["IDEA","DRAFT"].includes(post.status)&&publications[post.id]?.state!=="PUBLISHED");
 if(pending.length)alerts.push({id:"review",message:`${pending.length} publicaciones de hoy o anteriores siguen como ideas o borradores. Revisa el contenido y su fecha.`,href:"/panel-profesional/planner"});
 const ready=posts.filter(post=>post.status==="READY"&&!["PUBLISHED","PUBLISHING"].includes(publications[post.id]?.state));
 const privateImages=ready.filter(post=>isPrivateCreativeImage(post.imageUrl));
 if(privateImages.length)alerts.push({id:"private-images",message:`${privateImages.length} propuestas listas conservan una imagen privada. Descarga, revisa y adjunta la imagen aprobada antes de programar su publicación.`,href:"/panel-profesional/planner"});
 const disconnected=ready.filter(post=>(post.platform==="instagram"||post.platform==="facebook")&&!networks[post.platform]?.canPublish);
 if(disconnected.length)alerts.push({id:"networks",message:`${disconnected.length} publicaciones listas requieren conectar o revisar los permisos de su red.`,href:"/panel-profesional/redes"});
 return alerts;
}
