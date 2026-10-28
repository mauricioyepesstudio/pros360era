import {businessActivity} from "../../data/professional/business-activities.ts";
import sharp from "sharp";
import type {CreativeOwner} from "./private-creative-handler.ts";
import {loadCreativeMedia} from "./creative-media.ts";
type Palette={background:string;ink:string;accent:string};
export function paletteFromCss(css:string):Palette{
 const get=(key:string)=>{const m=css.match(new RegExp("--"+key+":\\s*(#[0-9a-fA-F]{6})\\s*;"));if(!m)throw Error("Missing brand token");return m[1];};
 return{background:get("warm-canvas"),ink:get("evolusa-navy"),accent:get("evolusa-red")};
}
const escape=(v:string)=>v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]!));
const wrap=(text:string,max:number)=>{const rows:string[]=[];let line="";for(const word of text.split(/\s+/)){if(word.length>max)throw Error("Copy width");if((line+" "+word).trim().length>max){rows.push(line);line=word;}else line=(line+" "+word).trim();}if(line)rows.push(line);return rows;};
export function creativeSvg(owner:CreativeOwner,concept:number,format:"4x5"|"9x16",p:Palette){
 if(!["4x5","9x16"].includes(format)||![1,2,3].includes(concept)||!Object.values(p).every(v=>/^#[a-fA-F0-9]{6}$/.test(v)))throw Error("Invalid render");
 const own=owner.reference;
 const name=(owner.business?.businessName||owner.displayName).replace(/[\u0000-\u001f]/g," ").slice(0,42);
 const document=["IMMIGRATION_DOCUMENT_SUPPORT","NOTARY"].includes(owner.category);
 const activity=owner.business?businessActivity(owner.business.activity):null;
 const headlines=activity?[activity.headline,"Prepara tus preguntas",`Conoce nuestro proceso`]:["Prepara tu próximo paso","Organiza tu conversación","Una pregunta para empezar"];
 const body=activity?"Organiza tus preguntas para "+activity.topic+". Confirma el alcance antes de comenzar.":document?"Organiza tus documentos y prepara tus preguntas. Confirma el alcance del servicio antes de comenzar.":"Define tu proyecto, organiza tus ideas y prepara las preguntas para tu próxima conversación.";
 const h=format==="4x5"?1350:1920,photoEnd=format==="4x5"?720:1120;
 const title=wrap(headlines[concept-1],25),lines=wrap(body,43);
 const text=(rows:string[],y:number,size:number,gap:number)=>rows.map((s,i)=>'<text x="88" y="'+(y+i*gap)+'" font-size="'+size+'" fill="'+p.background+'">'+escape(s)+'</text>').join("");
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="'+h+'"><rect width="1080" height="250" fill="'+p.background+'"/><rect y="'+photoEnd+'" width="1080" height="'+(h-photoEnd)+'" fill="'+p.ink+'"/><g font-family="Poppins, sans-serif"><text x="'+(own?270:88)+'" y="'+(own?115:202)+'" font-size="'+Math.min(own?32:38,Math.floor((own?500:850)/(Math.max(name.length,1)*0.7)))+'" font-weight="700" fill="'+p.ink+'">'+escape(name)+'</text>'+(own?'<text x="270" y="172" font-size="18" fill="'+p.ink+'">'+escape(own.label.slice(0,58))+'</text>':'')+'<rect x="68" y="'+(photoEnd-67)+'" width="490" height="47" rx="8" fill="'+p.ink+'"/><text x="88" y="'+(photoEnd-35)+'" font-size="21" fill="'+p.background+'">'+(own?"REFERENCIA DE TU CONTENIDO":"IMAGEN ILUSTRATIVA")+'</text><rect x="88" y="'+(photoEnd+45)+'" width="100" height="8" fill="'+p.accent+'"/><g font-weight="700">'+text(title,photoEnd+130,64,78)+'</g>'+text(lines,photoEnd+130+title.length*78+40,32,46)+'<rect x="88" y="'+(h-140)+'" width="904" height="2" fill="'+p.accent+'"/><text x="88" y="'+(h-88)+'" font-size="24" fill="'+p.background+'">TU PRÓXIMO PASO · EVOLUSA</text><text x="88" y="'+(h-46)+'" font-size="20" fill="'+p.background+'">BORRADOR PRIVADO · REVISIÓN PENDIENTE</text></g></svg>';
}
export async function renderPrivateCreative(owner:CreativeOwner,concept:number,format:"4x5"|"9x16",p:Palette){
 if(owner.reference?.accent)p={...p,accent:owner.reference.accent};
 const svg=creativeSvg(owner,concept,format,p);
 const media=await loadCreativeMedia(owner.category);
 const h=format==="4x5"?1350:1920,photoHeight=format==="4x5"?470:870;
 const photo=await sharp(owner.reference?.image??media.photo,{limitInputPixels:20_000_000}).rotate().resize(1080,photoHeight,{fit:owner.reference?"contain":"cover",position:"centre",background:p.background}).png().toBuffer();
 const avatar=owner.reference?.avatar?await sharp(owner.reference.avatar,{limitInputPixels:20_000_000}).resize(140,140,{fit:"contain",background:p.background}).png().toBuffer():null;
 const logo=await sharp(media.logo,{limitInputPixels:20_000_000}).resize({width:owner.reference?180:390,height:100,fit:"inside"}).png().toBuffer();
 return new Uint8Array(await sharp({create:{width:1080,height:h,channels:4,background:p.background}})
 .composite([{input:photo,top:250,left:0},{input:Buffer.from(svg),top:0,left:0},{input:logo,top:50,left:owner.reference?800:88},...(avatar?[{input:avatar,top:50,left:88}]:[])]).png().toBuffer());
}
