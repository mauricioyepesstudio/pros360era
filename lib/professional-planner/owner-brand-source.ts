import {createSupabaseServiceRoleClient} from "@/lib/supabase/service";
import {getInstagramConfig,INSTAGRAM_GRAPH_VERSION} from "@/lib/social/instagram";
import {decryptToken} from "@/lib/social/crypto";
import {tokenBinding} from "@/lib/social/connections";
import {accountMatchesBrand,instagramBrandReference,ownPortfolioPhoto,readBrandImage,suggestedAccent,type BrandReference} from "./brand-reference";
export async function loadOwnerBrandReference(userId:string,profile:{photo_url:string|null;social_links:unknown}):Promise<BrandReference|null>{
 const photo=userId==="b96cae5b-41a4-44c8-a3ee-7343b10080f1"?ownPortfolioPhoto(profile.photo_url):null;
 if(photo){const image=await readBrandImage(photo,fetch,true);if(image)return {image,avatar:image,label:"Foto de tu perfil · paleta sugerida",accent:await suggestedAccent(image)};}
 const service=createSupabaseServiceRoleClient(),config=getInstagramConfig();if(!service||!config)return null;
 const {data,error}=await service.from("social_connections").select("username,provider_account_id,token_ciphertext,status,scopes,token_expires_at").eq("user_id",userId).eq("provider","instagram").maybeSingle();
 if(error||!data||data.status!=="ACTIVE"||!Array.isArray(data.scopes)||!data.scopes.includes("instagram_business_basic")||!data.token_ciphertext)return null;
 const expires=Date.parse(data.token_expires_at);if(!Number.isFinite(expires)||expires<=Date.now())return null;
 const links=profile.social_links&&typeof profile.social_links==="object"?profile.social_links as Record<string,unknown>:{};
 if(!accountMatchesBrand(links.instagram,data.username))return null;
 const token=decryptToken(data.token_ciphertext,config.tokenKey,tokenBinding("instagram",data.provider_account_id));if(!token)return null;
 return instagramBrandReference({accountId:data.provider_account_id,username:data.username,token,version:INSTAGRAM_GRAPH_VERSION});
}
