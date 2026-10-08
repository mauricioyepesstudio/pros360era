"use server";
import { revalidatePath } from "next/cache";
import { saveMyInitialCall, cancelMyInitialCall } from "@/lib/initial-call/persistence";
export async function requestInitialCallAction(input: unknown) { const r = await saveMyInitialCall(input); if(r.saved) revalidatePath("/videollamada-inicial"); return r; }
export async function cancelInitialCallAction() { const r = await cancelMyInitialCall(); if(r.saved) revalidatePath("/videollamada-inicial"); return r; }
