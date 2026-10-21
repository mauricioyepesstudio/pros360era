import sharp from "sharp";
import type {CreativeOwner} from "./private-creative-handler.ts";
type Palette={background:string;ink:string;accent:string};
export function paletteFromCss(css:string):Palette{
 const get=(key:string)=>{const m=css.match(new RegExp("--"+key+":\\s*(#[0-9a-fA-F]{6})\\s*;"));if(!m)throw Error("Missing brand token");return m[1];};
 return{background:get("warm-canvas"),ink:get("evolusa-navy"),accent:get("evolusa-red")};
}
const escape=(v:string)=>v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]!));
const wrap=(text:string,max:number)=>{const rows:string[]=[];let line="";for(const word of text.split(/\s+/)){if(word.length>max)throw Error("Copy width");if((line+" "+word).trim().length>max){rows.push(line);line=word;}else line=(line+" "+word).trim();}if(line)rows.push(line);return rows;};
export function creativeSvg(owner:CreativeOwner,concept:number,format:"4x5"|"9x16",p:Palette){
 if(!["4x5","9x16"].includes(format)||![1,2,3].includes(concept)||!Object.values(p).every(v=>/^#[a-fA-F0-9]{6}$/.test(v)))throw Error("Invalid render");
 const name=owner.displayName.replace(/[\u0000-\u001f]/g," ").slice(0,42);
 const document=owner.category==="IMMIGRATION_DOCUMENT_SUPPORT";
 const notary=owner.category==="NOTARY";
 const headlines=["Prepara tu próximo paso","Organiza tu conversación","Una pregunta para empezar"];
 const body=document?"Reúne tus documentos y anota tus preguntas. Confirma el alcance del servicio antes de comenzar.":notary?"Prepara tus preguntas y consulta los requisitos del trámite con el profesional correspondiente.":"Define qué necesitas, reúne tu información y prepara tus preguntas antes de comenzar.";
 const h=format==="4x5"?1350:1920,top=format==="4x5"?350:540;
 const title=wrap(headlines[concept-1],22),lines=wrap(body,34);
 const text=(rows:string[],y:number,size:number,gap:number)=>rows.map((s,i)=>'<text x="88" y="'+(y+i*gap)+'" font-size="'+size+'" fill="'+p.ink+'">'+escape(s)+'</text>').join("");
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="'+h+'"><rect width="1080" height="'+h+'" fill="'+p.background+'"/><circle cx="1040" cy="110" r="250" fill="none" stroke="'+p.accent+'" stroke-width="3" opacity=".2"/><g font-family="sans-serif"><rect x="88" y="96" width="130" height="12" fill="'+p.accent+'"/><text x="88" y="160" font-size="27" letter-spacing="3" fill="'+p.ink+'">EVOLUSA · COMUNIDAD PROFESIONAL</text><text x="88" y="230" font-size="'+Math.min(38,Math.floor(850/(Math.max(name.length,1)*0.7)))+'" font-weight="700" fill="'+p.ink+'">'+escape(name)+'</text>'+text(title,top,72,88)+text(lines,top+title.length*88+95,38,57)+'<rect x="88" y="'+(h-330)+'" width="904" height="2" fill="'+p.accent+'"/><text x="88" y="'+(h-260)+'" font-size="27" fill="'+p.ink+'">PREGUNTA · ORGANIZA · REVISA</text><text x="88" y="'+(h-150)+'" font-size="25" fill="'+p.ink+'">Propuesta editable con identidad de EVOLUSA</text><text x="88" y="'+(h-90)+'" font-size="22" fill="'+p.ink+'">BORRADOR PRIVADO · REVISIÓN PENDIENTE</text></g></svg>';
}
export async function renderPrivateCreative(owner:CreativeOwner,concept:number,format:"4x5"|"9x16",p:Palette){return new Uint8Array(await sharp(Buffer.from(creativeSvg(owner,concept,format,p)),{limitInputPixels:1080*1920}).png().toBuffer());}
