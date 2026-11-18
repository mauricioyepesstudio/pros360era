import {businessActivity} from "../../data/professional/business-activities.ts";
import sharp, {type OverlayOptions} from "sharp";
import path from "node:path";
import {readFile} from "node:fs/promises";
import type {CreativeOwner} from "./private-creative-handler.ts";
type Palette={background:string;ink:string;accent:string};
export function paletteFromCss(css:string):Palette{
 const get=(key:string)=>{const m=css.match(new RegExp("--"+key+":\\s*(#[0-9a-fA-F]{6})\\s*;"));if(!m)throw Error("Missing brand token");return m[1];};
 return{background:get("warm-canvas"),ink:get("evolusa-navy"),accent:get("evolusa-red")};
}
const escape=(v:string)=>v.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]!));
const clean=(value:string,max:number)=>Array.from(value.replace(/[\u0000-\u001f]/g," ")).slice(0,max).join("");
type TextLayer={text:string;left:number;top:number;width:number;size:number;color:string;bold?:boolean};
/** Same content model powers both formats; owner identity never comes from another account or stock portrait. */
export function creativeLayout(owner:CreativeOwner,concept:number,format:"4x5"|"9x16",p:Palette){
 if(!["4x5","9x16"].includes(format)||![1,2,3].includes(concept)||!Object.values(p).every(v=>/^#[a-fA-F0-9]{6}$/.test(v)))throw Error("Invalid render");
 const h=format==="4x5"?1350:1920;
 const activity=owner.business?businessActivity(owner.business.activity):null;
 const name=clean(owner.business?.businessName||owner.displayName,54);
 const document=["IMMIGRATION_DOCUMENT_SUPPORT","NOTARY"].includes(owner.category);
 const title=concept===1?(activity?.headline??"Prepara tu próximo paso"):concept===2?"Tres pasos antes de comenzar":"Conversemos sobre tu próximo paso";
 const topic=activity?.topic??(document?"organizar tus documentos y preguntas":"definir tu proyecto y organizar tus ideas");
 const layers:TextLayer[]=[
  {text:name,left:72,top:75,width:650,size:name.length>30?25:32,color:p.ink,bold:true},
  {text:activity?.label??"Tu espacio profesional",left:72,top:155,width:900,size:22,color:p.ink},
  {text:["UNA IDEA PARA EMPEZAR","GUÍA PARA TU CONVERSACIÓN","PREPARA TU CONSULTA"][concept-1],left:72,top:260,width:900,size:22,color:p.accent,bold:true},
  {text:title,left:72,top:320,width:900,size:title.length>44?52:concept===3?58:64,color:p.ink,bold:true},
  {text:"BORRADOR PRIVADO · REVISIÓN PENDIENTE",left:72,top:h-70,width:920,size:20,color:p.ink},
 ];
 const footer=h-205;
 layers.push({text:"TU PRÓXIMO PASO",left:72,top:footer+40,width:900,size:28,color:p.background,bold:true});
 if(concept===2){
  ["Define lo que necesitas","Reúne tus preguntas y documentos","Confirma el alcance antes de comenzar"].forEach((text,i)=>{
   const top=580+i*(format==="4x5"?150:280);
   layers.push({text:`0${i+1}`,left:92,top:top+22,width:100,size:36,color:p.accent,bold:true},{text,left:220,top:top+25,width:710,size:32,color:p.ink,bold:true});
  });
 }else{
  layers.push({text:`Antes de comenzar: ${topic.charAt(0).toUpperCase()+topic.slice(1)}.`,left:72,top:550,width:900,size:34,color:p.ink});
  if(concept===1)layers.push({text:"Antes de decidir",left:108,top:820,width:830,size:40,color:p.background,bold:true},{text:"Confirma los requisitos y el alcance del servicio con el profesional.",left:108,top:905,width:800,size:30,color:p.background});
  else layers.push({text:owner.reference?"Referencia visual de tu propia cuenta":"Organiza tus ideas. Prepara tus preguntas.",left:72,top:footer-70,width:900,size:22,color:p.ink});
 }
 let shapes=`<rect width="1080" height="${h}" fill="${p.background}"/><rect x="72" y="220" width="936" height="4" fill="${p.accent}"/><rect y="${footer}" width="1080" height="120" fill="${p.ink}"/>`;
 if(concept===1)shapes+=`<rect x="72" y="770" width="936" height="${format==="4x5"?320:650}" rx="24" fill="${p.ink}"/><circle cx="890" cy="${format==="4x5"?1040:1330}" r="46" fill="${p.accent}"/>`;
 if(concept===2)for(let i=0;i<3;i++)shapes+=`<rect x="72" y="${580+i*(format==="4x5"?150:280)}" width="936" height="${format==="4x5"?130:240}" rx="16" fill="none" stroke="${p.ink}" stroke-width="2"/>`;
 if(concept===3&&!owner.reference)shapes+=`<rect x="72" y="740" width="936" height="${format==="4x5"?260:750}" rx="24" fill="${p.ink}"/><path d="M140 860h600m-80-65 80 65-80 65" stroke="${p.accent}" stroke-width="20" fill="none"/>`;
 return {h,layers,shapes,usesReference:concept===3&&Boolean(owner.reference)};
}
/** Debug/inspection SVG. PNG text is rendered separately with an explicit bundled font file. */
export function creativeSvg(owner:CreativeOwner,concept:number,format:"4x5"|"9x16",p:Palette){
 const {h,layers,shapes}=creativeLayout(owner,concept,format,p);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${h}">${shapes}${layers.map(layer=>`<text x="${layer.left}" y="${layer.top}" fill="${layer.color}">${escape(layer.text)}</text>`).join("")}</svg>`;
}
/** Native text must never depend on web next/font CSS or OS font discovery (serverless has no font guarantee). */
export async function renderCreativeText(layer:TextLayer){
 const fontfile=path.join(process.cwd(),"assets/fonts/poppins",layer.bold?"Poppins-SemiBold.ttf":"Poppins-Regular.ttf");
 await readFile(fontfile); // Fail closed if a deployment omitted the required bundled font.
 return sharp({text:{text:`<span foreground="${layer.color}">${escape(layer.text)}</span>`,font:`Poppins ${layer.bold?"SemiBold ":""}${layer.size}`,fontfile,width:layer.width,dpi:72,rgba:true,wrap:"word"}}).png().toBuffer();
}
export async function renderPrivateCreative(owner:CreativeOwner,concept:number,format:"4x5"|"9x16",p:Palette){
 // Keep the canonical brand palette: an arbitrary photo's dominant color can make text inaccessible.
 const {h,layers,shapes,usesReference}=creativeLayout(owner,concept,format,p);
 const composites:OverlayOptions[]=[{input:Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${h}">${shapes}</svg>`),top:0,left:0}];
 if(usesReference&&owner.reference){
  const photoHeight=format==="4x5"?300:780;
  const photo=await sharp(owner.reference.image,{limitInputPixels:20_000_000}).rotate().resize(936,photoHeight,{fit:"contain",background:p.background}).png().toBuffer();
  composites.push({input:photo,top:735,left:72});
 }
 const logo=await sharp(await readFile(path.join(process.cwd(),"public/brand/evolusa-primary.png")),{limitInputPixels:20_000_000}).resize({width:230,height:80,fit:"inside"}).png().toBuffer();
 composites.push({input:logo,top:62,left:778});
 for(const layer of layers)composites.push({input:await renderCreativeText(layer),top:layer.top,left:layer.left});
 return new Uint8Array(await sharp({create:{width:1080,height:h,channels:4,background:p.background}}).composite(composites).png().toBuffer());
}
