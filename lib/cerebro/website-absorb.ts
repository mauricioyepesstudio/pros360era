/**
 * Lee la web pública de un profesional y saca señales de marca para PROPONER
 * un brandbook en borrador: nombre, descripción, colores, tipografías y redes
 * enlazadas. Nunca guarda nada solo: el profesional revisa y decide.
 *
 * Seguridad: solo https en el puerto por defecto, sin credenciales en la URL,
 * se rechazan IPs privadas/locales en cada salto, máximo 3 redirecciones,
 * 6 s y 1,5 MB de HTML. No se envían cookies ni tokens.
 */
import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";
import { normalizeHexColor } from "./brand-kit.ts";

export type WebsiteSignals = {
  url: string;
  name: string | null;
  description: string | null;
  colors: string[];
  fonts: string[];
  socials: { platform: "instagram" | "facebook" | "linkedin" | "tiktok" | "youtube" | "x"; url: string }[];
};

const maxHtml = 1_500_000;
const socialHosts: Record<string, WebsiteSignals["socials"][number]["platform"]> = {
  "instagram.com": "instagram",
  "facebook.com": "facebook",
  "linkedin.com": "linkedin",
  "tiktok.com": "tiktok",
  "youtube.com": "youtube",
  "x.com": "x",
  "twitter.com": "x",
};
const genericFonts = new Set(["inherit", "initial", "unset", "serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-sans-serif", "ui-serif", "ui-monospace", "-apple-system", "blinkmacsystemfont", "segoe ui", "roboto", "helvetica", "helvetica neue", "arial", "noto sans", "apple color emoji", "segoe ui emoji", "segoe ui symbol", "noto color emoji", "var"]);

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&#(\d{1,6});/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, " ").trim();
}

function metaContent(html: string, attr: "name" | "property", key: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const keyMatch = tag.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i"));
    if (keyMatch?.[1].toLowerCase() !== key) continue;
    const content = tag.match(/content\s*=\s*"([^"]*)"|content\s*=\s*'([^']*)'/i);
    const value = content ? decodeEntities(content[1] ?? content[2] ?? "") : "";
    if (value) return value;
  }
  return null;
}

/** ¿El color es gris, casi blanco o casi negro? No sirve como color de marca. */
function isNeutral(hex: string): boolean {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const light = (r + g + b) / 3;
  return spread < 24 || light > 245 || light < 12;
}

/** Puro: HTML → señales de marca. Se prueba sin red. */
export function extractBrandSignals(html: string, pageUrl: string): WebsiteSignals {
  const head = html.slice(0, maxHtml);
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const name = metaContent(head, "property", "og:site_name") ?? (title ? decodeEntities(title[1]).split(/\s[|\-–·]\s/)[0] : null);
  const description = metaContent(head, "name", "description") ?? metaContent(head, "property", "og:description");

  const colorCount = new Map<string, number>();
  const bump = (value: string | null, weight: number) => { if (value && !isNeutral(value)) colorCount.set(value, (colorCount.get(value) ?? 0) + weight); };
  bump(normalizeHexColor(metaContent(head, "name", "theme-color")), 50);
  const styles = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n") + "\n" + [...head.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)].map((m) => m[1]).join(";");
  for (const match of styles.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) bump(normalizeHexColor("#" + match[1]), 1);
  const colors = [...colorCount.entries()].sort((a, b) => b[1] - a[1]).map(([color]) => color).slice(0, 5);

  const fonts: string[] = [];
  const addFont = (raw: string) => {
    const font = decodeEntities(raw).replace(/^["']|["']$/g, "").replace(/\+/g, " ").trim();
    if (font && font.length <= 40 && !genericFonts.has(font.toLowerCase()) && !font.startsWith("var(") && !fonts.some((f) => f.toLowerCase() === font.toLowerCase())) fonts.push(font);
  };
  for (const link of head.matchAll(/https:\/\/fonts\.googleapis\.com\/css2?\?[^"'\s>]+/gi)) {
    for (const family of link[0].replace(/&amp;/g, "&").matchAll(/family=([^:&]+)/g)) addFont(decodeURIComponent(family[1]));
  }
  for (const decl of styles.matchAll(/font-family\s*:\s*([^;}]+)/gi)) addFont(decl[1].split(",")[0]);

  const socials: WebsiteSignals["socials"] = [];
  for (const href of head.matchAll(/href\s*=\s*["'](https?:\/\/[^"']+)["']/gi)) {
    try {
      const url = new URL(decodeEntities(href[1]));
      const host = url.hostname.replace(/^www\.|^m\./, "");
      const platform = socialHosts[host];
      const path = url.pathname.split("/").filter(Boolean);
      if (!platform || !path.length || ["sharer", "share", "intent", "sharer.php", "shareArticle", "p", "reel", "watch"].includes(path[0])) continue;
      if (socials.some((s) => s.platform === platform)) continue;
      socials.push({ platform, url: `https://${host}/${path.slice(0, platform === "linkedin" ? 2 : 1).join("/")}` });
    } catch { /* enlace roto: se ignora */ }
  }

  return { url: pageUrl, name: name?.slice(0, 120) || null, description: description?.slice(0, 600) || null, colors, fonts: fonts.slice(0, 4), socials };
}

/** IPs a las que nunca se conecta el servidor (red local, loopback, metadatos de nube…). */
export function isPrivateAddress(address: string): boolean {
  const mapped = address.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  const ip = mapped ? mapped[1] : address.toLowerCase();
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19));
  }
  if (isIP(ip) === 6) return ip === "::" || ip === "::1" || /^f[cd]/.test(ip) || /^fe[89ab]/.test(ip) || ip.startsWith("ff");
  return true;
}

export function publicWebsiteUrl(value: unknown): URL | null {
  if (typeof value !== "string" || value.length > 500) return null;
  try {
    const url = new URL(value.trim().match(/^https?:\/\//i) ? value.trim() : "https://" + value.trim());
    if (url.protocol === "http:") url.protocol = "https:";
    if (url.protocol !== "https:" || url.username || url.password || url.port || isIP(url.hostname.replace(/^\[|\]$/g, "")) || !url.hostname.includes(".")) return null;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

type Deps = { fetcher?: typeof fetch; lookup?: (host: string) => Promise<{ address: string }[]> };

export async function readWebsiteSignals(input: unknown, deps: Deps = {}): Promise<{ ok: true; signals: WebsiteSignals } | { ok: false; message: string }> {
  const fetcher = deps.fetcher ?? fetch;
  const lookup = deps.lookup ?? ((host: string) => dnsLookup(host, { all: true, verbatim: true }));
  let url = publicWebsiteUrl(input);
  if (!url) return { ok: false, message: "Escribe la dirección pública de tu web, por ejemplo https://tunegocio.com." };
  try {
    for (let hop = 0; hop < 4; hop++) {
      const addresses = await lookup(url.hostname);
      if (!addresses.length || addresses.some((entry) => isPrivateAddress(entry.address))) return { ok: false, message: "No podemos leer esa dirección. Usa la web pública de tu negocio." };
      const response = await fetcher(url.href, { redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(6000), headers: { Accept: "text/html", "User-Agent": "EVOLUSA-brandbook/1.0" } });
      if (response.status >= 300 && response.status < 400) {
        const next = publicWebsiteUrl(new URL(response.headers.get("location") ?? "", url).href);
        await response.body?.cancel();
        if (!next || hop === 3) return { ok: false, message: "Tu web redirige demasiadas veces o a una dirección que no podemos leer." };
        url = next;
        continue;
      }
      if (!response.ok || !/text\/html|application\/xhtml/i.test(response.headers.get("content-type") ?? "") || !response.body) {
        await response.body?.cancel();
        return { ok: false, message: "Tu web no respondió con una página que podamos leer. Revisa la dirección." };
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (size < maxHtml) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        chunks.push(part.value);
      }
      await reader.cancel().catch(() => undefined);
      const html = new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks).subarray(0, maxHtml));
      return { ok: true, signals: extractBrandSignals(html, url.href) };
    }
  } catch {
    return { ok: false, message: "No pudimos abrir tu web ahora. Revisa la dirección o inténtalo en unos minutos." };
  }
  return { ok: false, message: "No pudimos abrir tu web ahora." };
}
