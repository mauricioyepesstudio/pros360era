import { createHash } from "node:crypto";
export function professionalScheduleId(userId:string):string {
 const h=createHash("sha256").update(`evolusa:professional-schedule-v1:${userId}`).digest("hex");
 return `${h.slice(0,8)}-${h.slice(8,12)}-8${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;
}
