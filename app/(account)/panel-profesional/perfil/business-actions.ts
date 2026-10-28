"use server";
import {revalidatePath} from "next/cache";
import {saveMyProfessionalBusiness} from "@/lib/professional-business/persistence";
export async function saveProfessionalBusinessAction(value:unknown){const result=await saveMyProfessionalBusiness(value);if(result.saved){for(const route of ["/panel-profesional","/panel-profesional/perfil","/panel-profesional/planner","/panel-profesional/creativos"])revalidatePath(route);}return result;}
