const APP_ORIGIN = "https://evolusa.vercel.app";
const AUTH_ORIGIN = "https://ovialqdazxkekvqqgdiu.supabase.co";
function allowedRequest(value, method) {
  let url;
  try { url = new URL(value); } catch { return false; }
  if (url.username || url.password) return false;
  if (url.origin === APP_ORIGIN) return method === "GET" && !/^\/(api|auth)(\/|$)/.test(url.pathname);
  if (url.origin !== AUTH_ORIGIN) return false;
  if (["/auth/v1/settings", "/auth/v1/user"].includes(url.pathname)) return ["GET", "OPTIONS"].includes(method);
  if (url.pathname === "/auth/v1/token") return ["POST", "OPTIONS"].includes(method) && url.searchParams.getAll("grant_type").length === 1 && url.searchParams.get("grant_type") === "password";
  if (url.pathname === "/auth/v1/logout") return method === "POST" && url.searchParams.getAll("scope").length === 1 && url.searchParams.get("scope") === "local";
  return false;
}
function allowedAccount(role, email) {
  return role === "MEMBER" || (role === "PRO" && email.trim().toLowerCase() === "mauricioyepes01@gmail.com");
}
module.exports = { APP_ORIGIN, AUTH_ORIGIN, allowedRequest, allowedAccount };
