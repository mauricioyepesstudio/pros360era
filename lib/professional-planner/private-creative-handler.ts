import {parsePrivateCreativeRequest} from "./private-creative-url.ts";
export type CreativeOwner={displayName:string;category:string};
const headers={"Cache-Control":"private, no-store, max-age=0","Vary":"Cookie","X-Content-Type-Options":"nosniff"};
export async function handlePrivateCreative(request:Request,deps:{owner:()=>Promise<CreativeOwner|null>;render:(owner:CreativeOwner,concept:number,format:"4x5"|"9x16")=>Promise<Uint8Array>}){
 const p=parsePrivateCreativeRequest(request.url);
 if(!p)return Response.json({error:"Solicitud no válida."},{status:400,headers});
 try{
 const owner=await deps.owner();if(!owner)return Response.json({error:"Necesitas tu sesión profesional."},{status:401,headers});
 const bytes=await deps.render(owner,p.concept,p.format);
 if(bytes.byteLength>5_000_000)throw Error("Oversized output");
 return new Response(new Uint8Array(bytes),{headers:{...headers,"Content-Type":"image/png","Content-Disposition":(p.download?"attachment":"inline")+'; filename="evolusa-propuesta-'+p.concept+'-'+p.format+'.png"'}});
 }catch{return Response.json({error:"No pudimos preparar tu propuesta. Reintenta más tarde."},{status:503,headers});}
}
