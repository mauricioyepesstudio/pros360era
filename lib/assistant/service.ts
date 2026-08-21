import type { RoadmapInput } from "@/data/account/types";
export type AssistantPrompt = { message: string; context: RoadmapInput };
export type AssistantResponse = { summary: string; suggestedActions: string[]; guidanceLabel: "EVOLUSA_GUIDE" };
export interface EvolusaAssistantService { respond(input: AssistantPrompt): Promise<AssistantResponse> }
export const assistantSuggestedPrompts = ["¿Qué debo hacer ahora?", "Quiero abrir un negocio.", "Conseguí trabajo, ¿qué debería organizar?", "Me voy a mudar.", "No entiendo mi Roadmap."] as const;
