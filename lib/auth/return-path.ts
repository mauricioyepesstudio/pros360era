/** Internal destinations only; never trust a redirect supplied by the browser. */
export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return "/dashboard";
  try { const u = new URL(value, "https://evolusa.invalid"); return u.origin === "https://evolusa.invalid" ? u.pathname + u.search + u.hash : "/dashboard"; } catch { return "/dashboard"; }
}
export const professionalWorkspacePath = "/dashboard/professional";
