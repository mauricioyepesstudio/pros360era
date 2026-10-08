import { z } from "zod";
export const leadStatusLabels = {
  new: "Nuevo", contacted: "Contactado", qualified: "Calificado",
  unqualified: "No calificado", converted: "Convertido", lost: "Perdido",
} as const;
export const leadId = z.uuid();
export const followupInput = z.object({
  status: z.enum(["new", "contacted", "qualified", "unqualified", "converted", "lost"]),
  notes: z.string().trim().max(2000),
  expectedUpdatedAt: z.iso.datetime({ offset: true }),
}).strict();
export const leadDetailColumns = "id,name,email,phone,whatsapp,source,source_url,status,notes,created_at,updated_at";
