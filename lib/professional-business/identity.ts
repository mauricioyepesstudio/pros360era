import {createHash} from "node:crypto";
export function professionalBusinessId(userId:string){const hash=createHash("sha256").update("evolusa:"+"professional-business-v1:"+userId).digest("hex");return `${hash.slice(0,8)}-${hash.slice(8,12)}-8${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;}
