/**
 * Owner rule (7-nov-2026): a professional's networks carry only their own
 * brand and business. EVOLUSA material (its name, its links, the explainer
 * videos in public/videos) goes out only from EVOLUSA's own planner.
 *
 * No imports so tests can load it under plain `node --test`.
 */
type BrandCheckedPost = { title: string; caption: string; imageUrl: string | null; status: string };

/** Accounts whose planner publishes to EVOLUSA's own networks. */
export const evolusaHouseEmails = ["hola.evolusa@gmail.com"] as const;

export function isEvolusaHouseAccount(email: string | null | undefined): boolean {
  return typeof email === "string" && (evolusaHouseEmails as readonly string[]).includes(email.trim().toLowerCase());
}

const evolusaName = /evol\s*usa/i;

/**
 * True when a post that could still go out carries EVOLUSA branding: the name
 * or a link in its title or caption, or an EVOLUSA-hosted video/creative.
 * PUBLISHED posts are history (imported from the network) and are never sent.
 */
export function isEvolusaBrandedPost(post: BrandCheckedPost): boolean {
  if (post.status === "PUBLISHED") return false;
  if (evolusaName.test(post.title) || evolusaName.test(post.caption)) return true;
  const media = post.imageUrl ?? "";
  return media.startsWith("/videos/") || evolusaName.test(media);
}

export const evolusaContentBlockedMessage = (title: string) =>
  `"${title}" lleva marca o material de EVOLUSA. En tus redes solo va contenido de tu propia marca y tu profesión: quítalo o cámbialo para guardar.`;

export const evolusaContentPublishError = "Bloqueada: lleva marca o material de EVOLUSA y en esta cuenta solo se publica contenido propio del profesional.";
