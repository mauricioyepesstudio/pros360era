import {businessActivity,type BusinessActivityId} from "../../data/professional/business-activities.ts";
export const professionalBusinessVersion="professional-business-v1";
export type ProfessionalBusiness={activity:BusinessActivityId;businessName:string;audience:string;services:string;offer:string;location:string};
const limits={businessName:120,audience:240,services:1200,offer:300,location:120} as const;
export function parseProfessionalBusiness(input:unknown):ProfessionalBusiness|null{
 if(!input||typeof input!=="object"||Array.isArray(input))return null;
 const value=input as Record<string,unknown>;
 if(Object.keys(value).length!==6||Object.keys(value).some(key=>key!=="activity"&&!Object.hasOwn(limits,key))||typeof value.activity!=="string"||!businessActivity(value.activity))return null;
 for(const [key,max]of Object.entries(limits))if(typeof value[key]!=="string"||!value[key].trim()||value[key].length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value[key] as string))return null;
 return {activity:value.activity as BusinessActivityId,businessName:(value.businessName as string).trim(),audience:(value.audience as string).trim(),services:(value.services as string).trim(),offer:(value.offer as string).trim(),location:(value.location as string).trim()};
}
export function businessOwnerAllowed(role:unknown,hasProfile:boolean){return hasProfile&&(role==="PROFESSIONAL"||role==="ADMIN");}
