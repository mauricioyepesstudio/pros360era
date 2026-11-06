export const privateCreativePath="/api/professional/creative-proposal";
export function isPrivateCreativeImage(value:string|null):boolean{
 if(!value)return false;
 try{const u=new URL(value,"https://evolusa.invalid");const p=decodeURIComponent(u.pathname).replace(/\\/g,"/").replace(/\/+$/,"");return p===privateCreativePath;}catch{return value.startsWith(privateCreativePath);}
}
export function privateCreativeImage(concept:number,format:"4x5"|"9x16"){return privateCreativePath+"?concept="+concept+"&format="+format;}
export function parsePrivateCreativeRequest(url:string){
 const u=new URL(url);if(u.pathname!==privateCreativePath)return null;
 const keys=[...u.searchParams.keys()];
 if(keys.some(k=>!["concept","format","download"].includes(k))||new Set(keys).size!==keys.length)return null;
 const c=u.searchParams.get("concept"),f=u.searchParams.get("format"),d=u.searchParams.get("download");
 return c&&/^[1-3]$/.test(c)&&(f==="4x5"||f==="9x16")&&(d===null||d==="1")?{concept:Number(c),format:f as "4x5"|"9x16",download:d==="1"}:null;
}
