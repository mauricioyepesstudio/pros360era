import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Server-only secrets for social connections. Tokens are stored encrypted
 * with AES-256-GCM under SOCIAL_TOKEN_KEY (32 random bytes, base64), a key
 * that lives only in Vercel. The same key signs the OAuth `state`, under a
 * separate derived subkey so one use can't be replayed as the other.
 */
const KEY_BYTES = 32;
const TOKEN_PREFIX = "v1";

export function readSocialTokenKey(raw: string | undefined = process.env.SOCIAL_TOKEN_KEY): Buffer | null {
  if (!raw) return null;
  const key = Buffer.from(raw.trim(), "base64");
  return key.length === KEY_BYTES ? key : null;
}

function subkey(key: Buffer, purpose: "token" | "state"): Buffer {
  return createHmac("sha256", key).update(`evolusa:social:${purpose}`).digest();
}

/** `bindTo` (the Instagram account id) is authenticated data: a ciphertext moved to another row won't decrypt. */
export function encryptToken(plain: string, key: Buffer, bindTo: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", subkey(key, "token"), iv);
  cipher.setAAD(Buffer.from(bindTo, "utf8"));
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [TOKEN_PREFIX, iv.toString("base64url"), tag.toString("base64url"), body.toString("base64url")].join(".");
}

export function decryptToken(sealed: string, key: Buffer, bindTo: string): string | null {
  const [prefix, iv, tag, body] = sealed.split(".");
  if (prefix !== TOKEN_PREFIX || !iv || !tag || !body) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", subkey(key, "token"), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    decipher.setAAD(Buffer.from(bindTo, "utf8"));
    return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export type OAuthState = { userId: string; nonce: string; exp: number };

/** `payload.signature`, both base64url. Expires after `ttlSeconds`. */
export function signState(state: OAuthState, key: Buffer): string {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  const signature = createHmac("sha256", subkey(key, "state")).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyState(value: string | null, key: Buffer, now = Date.now()): OAuthState | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", subkey(key, "state")).update(payload).digest();
  if (!safeEqual(expected, Buffer.from(signature, "base64url"))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<OAuthState>;
    if (typeof parsed.userId !== "string" || typeof parsed.nonce !== "string" || typeof parsed.exp !== "number") return null;
    if (parsed.exp * 1000 < now) return null;
    return { userId: parsed.userId, nonce: parsed.nonce, exp: parsed.exp };
  } catch {
    return null;
  }
}

export function newNonce(): string {
  return randomBytes(16).toString("base64url");
}

/**
 * Meta's `signed_request` (deauthorize and data-deletion callbacks):
 * base64url(HMAC-SHA256(payload, app secret)) + "." + base64url(JSON).
 */
export function parseSignedRequest(value: string | null, appSecret: string): Record<string, unknown> | null {
  if (!value || !appSecret) return null;
  const [signature, payload] = value.split(".");
  if (!signature || !payload) return null;
  const expected = createHmac("sha256", appSecret).update(payload).digest();
  if (!safeEqual(expected, Buffer.from(signature, "base64url"))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
    if (typeof data.algorithm !== "string" || data.algorithm.toUpperCase() !== "HMAC-SHA256") return null;
    return data;
  } catch {
    return null;
  }
}
