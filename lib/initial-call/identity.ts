import { parseStoredInitialCall } from "./validation.ts";
import { createHash } from "node:crypto";
/** One request row per account; atomic upsert prevents double clicks creating duplicates. */
export function initialCallId(userId: string): string {
  const h = createHash("sha256").update(`evolusa:initial-call-v1:${userId}`).digest("hex");
  return `${h.slice(0,8)}-${h.slice(8,12)}-8${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;
}

export function parseCanonicalInitialCallRow(row: {id: string; user_id: string; answers: unknown}) {
 return row.id === initialCallId(row.user_id) ? parseStoredInitialCall(row.answers) : null;
}
