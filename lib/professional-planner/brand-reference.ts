import sharp from "sharp";
export type BrandReference={image:Buffer;avatar:Buffer|null;label:string;accent:string|null};
type Fetch=typeof fetch;
export function accountMatchesBrand(declared:unknown,username:string):boolean{
 if(typeof username!=="string")return false;
 if(declared===undefined||declared===null||declared==="")return /^[a-z0-9._]{1,30}$/i.test(username);
 if(typeof declared!=="string")return false;
 try{const u=new URL(declared);if(u.protocol!=="https:"||u.username||u.password||u.port||!["instagram.com","www.instagram.com"].includes(u.hostname))return false;
 const parts=u.pathname.split("/").filter(Boolean);return parts.length===1&&parts[0].toLowerCase()===username.toLowerCase();}catch{return false;}
}
export function brandImageUrl(value:unknown):string|null{
 if(typeof value!=="string"||value.length>4096)return null;
 try{const u=new URL(value);if(u.protocol!=="https:"||u.username||u.password||u.port)return null;
 if(!u.hostname.endsWith(".cdninstagram.com")&&!u.hostname.endsWith(".fbcdn.net"))return null;
 return u.href;}catch{return null;}
}
export function ownPortfolioPhoto(value:unknown):string|null{
 if(typeof value!=="string")return null;
 try{const u=new URL(value);if(u.origin!=="https://mauricio-portfolio-v2.vercel.app"||u.username||u.password)return null;
 if(u.pathname==="/images/mauricio.png"||(u.pathname==="/_next/image"&&u.searchParams.get("url")==="/images/mauricio.png"))return u.origin+"/images/mauricio.png";
 }catch{}return null;
}
export const portfolioBrandLogo="https://mauricio-portfolio-v2.vercel.app/brand/rge/rge-lockup-black.png";
/** No credentials leave the Graph request. Streaming cap applies even without Content-Length. */
export async function readBrandImage(url:string,fetcher:Fetch=fetch,portfolio=false):Promise<Buffer|null>{
 if(!(portfolio?(ownPortfolioPhoto(url)||url===portfolioBrandLogo):brandImageUrl(url)))return null;
 try{const r=await fetcher(url,{redirect:"error",cache:"no-store",signal:AbortSignal.timeout(5000)});
 if(!r.ok||!/^image\/(jpeg|png|webp)(;|$)/i.test(r.headers.get("content-type")||"")||!r.body)return null;
 const max=5_000_000,len=Number(r.headers.get("content-length"));if(len>max){await r.body.cancel();return null;}
 const reader=r.body.getReader();const chunks:Uint8Array[]=[];let count=0;
 try{while(true){const part=await reader.read();if(part.done)break;count+=part.value.byteLength;if(count>max){await reader.cancel();return null;}chunks.push(part.value);}}finally{reader.releaseLock();}
 const b=Buffer.concat(chunks);const m=await sharp(b,{limitInputPixels:20_000_000}).metadata();
 if(!m.width||!m.height||m.width*m.height>20_000_000||!["jpeg","png","webp"].includes(m.format||""))return null;
 return b;
 }catch{return null;}
}
export async function suggestedAccent(image:Buffer):Promise<string|null>{
 const {dominant:c}=await sharp(image,{limitInputPixels:20_000_000}).resize(80,80,{fit:"inside"}).stats();
 const values=[c.r,c.g,c.b],spread=Math.max(...values)-Math.min(...values);
 return spread<35?null:"#"+values.map(v=>Math.round(v).toString(16).padStart(2,"0")).join("");
}
export async function instagramBrandReference(input:{accountId:string;username:string;token:string;version:string},fetcher:Fetch=fetch):Promise<BrandReference|null>{
 if(!/^\d{1,40}$/.test(input.accountId)||!/^v\d+\.\d+$/.test(input.version)||!accountMatchesBrand(null,input.username))return null;
 try{
 const base="https://graph.instagram.com/"+input.version+"/"+input.accountId;
 const init={headers:{Authorization:"Bearer "+input.token},cache:"no-store" as const,redirect:"error" as const,signal:AbortSignal.timeout(6000)};
 const r=await fetcher(base+"?fields=username,profile_picture_url",init);if(!r.ok)return null;
 const account=await r.json();if(typeof account.username!=="string"||account.username.toLowerCase()!==input.username.toLowerCase())return null;
 const avatarUrl=brandImageUrl(account.profile_picture_url);
 const mediaResponse=await fetcher(base+"/media?fields=media_type,media_url,thumbnail_url&limit=3",{...init,signal:AbortSignal.timeout(6000)});
 let imageUrl:string|null=null;
 if(mediaResponse.ok){const body=await mediaResponse.json();if(Array.isArray(body.data)){for(const row of body.data.slice(0,3)){imageUrl=brandImageUrl(row.media_type==="VIDEO"?row.thumbnail_url:row.media_url);if(imageUrl)break;}}}
 const avatar=avatarUrl?await readBrandImage(avatarUrl,fetcher):null;
 const image=imageUrl?await readBrandImage(imageUrl,fetcher):avatar;
 if(!image)return null;
 return{image,avatar,label:"Referencia @"+input.username+" · paleta sugerida",accent:await suggestedAccent(image)};
 }catch{return null;}
}
