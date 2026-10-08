"use server";
import { revalidatePath } from "next/cache";
import { saveMyProfessionalSchedule,saveMyBookingUrl } from "@/lib/professional-schedule/persistence";
export async function saveScheduleAction(value:unknown){const r=await saveMyProfessionalSchedule(value);if(r.saved)revalidatePath("/panel-profesional/agenda");return r;}
export async function saveBookingUrlAction(value:unknown){const r=await saveMyBookingUrl(value);if(r.saved){revalidatePath("/panel-profesional/agenda");revalidatePath("/panel-profesional/perfil");}return r;}
