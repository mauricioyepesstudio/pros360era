import { safeReturnPath } from "../auth/return-path.ts";
export function initialCallDestination(next: string, initialCall: boolean): string {
 const safe = safeReturnPath(next);
 return initialCall ? `/videollamada-inicial?returnTo=${encodeURIComponent(safe)}` : safe;
}
export function authEntryHref(mode: "login" | "signup", next: string, initialCall: boolean): string {
 return `/${mode}?next=${encodeURIComponent(safeReturnPath(next))}${initialCall ? "&initialCall=1" : ""}`;
}
