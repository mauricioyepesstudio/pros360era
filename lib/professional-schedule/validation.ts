export const professionalScheduleVersion = "professional-schedule-v1";
export const scheduleDays = {MON:"Lunes",TUE:"Martes",WED:"Miércoles",THU:"Jueves",FRI:"Viernes",SAT:"Sábado",SUN:"Domingo"} as const;
export type ScheduleDay = {day: keyof typeof scheduleDays; enabled: boolean; start: string; end: string};
export type ProfessionalSchedule = {timeZone: string; status: "ACTIVE" | "PAUSED"; days: ScheduleDay[]};
export function emptySchedule(): ProfessionalSchedule { return {timeZone:"America/New_York",status:"PAUSED",days:Object.keys(scheduleDays).map(day=>({day:day as ScheduleDay["day"],enabled:false,start:"09:00",end:"17:00"}))}; }
export function parseProfessionalSchedule(value:unknown):ProfessionalSchedule|null {
 if(!value || typeof value!=="object" || Array.isArray(value))return null;
 const v=value as Record<string,unknown>;
 if(Object.keys(v).some(k=>!["timeZone","status","days"].includes(k)) || typeof v.timeZone!=="string" || v.timeZone.length>80 || !["ACTIVE","PAUSED"].includes(v.status as string) || !Array.isArray(v.days) || v.days.length!==7)return null;
 try {new Intl.DateTimeFormat("es",{timeZone:v.timeZone});} catch {return null;}
 const days:ScheduleDay[]=[];
 for(const item of v.days){
  if(!item || typeof item!=="object" || Array.isArray(item)) return null;
  const d=item as Record<string,unknown>;
  if(Object.keys(d).some(k=>!["day","enabled","start","end"].includes(k)) || typeof d.day!=="string" || !Object.hasOwn(scheduleDays,d.day) || days.some(x=>x.day===d.day) || typeof d.enabled!=="boolean" || typeof d.start!=="string" || typeof d.end!=="string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.end) || (d.enabled && d.start>=d.end))return null;
  days.push({day:d.day as ScheduleDay["day"],enabled:d.enabled,start:d.start,end:d.end});
 }
 if(v.status==="ACTIVE" && !days.some(d=>d.enabled))return null;
 return {timeZone:v.timeZone,status:v.status as ProfessionalSchedule["status"],days:Object.keys(scheduleDays).map(day=>days.find(d=>d.day===day)!)};
}
export function parseBookingUrl(value:unknown): {valid:boolean;url:string|null} {
 if(value===null || value==="")return {valid:true,url:null};
 if(typeof value!=="string" || value.length>500)return {valid:false,url:null};
 try {const u=new URL(value.trim()); if(u.protocol!=="https:" || u.username || u.password)return {valid:false,url:null};return {valid:true,url:u.href};}catch{return {valid:false,url:null};}
}
export function professionalScheduleAllowed(role:unknown,hasProfile:boolean):boolean {return hasProfile && (role==="PROFESSIONAL" || role==="ADMIN");}
