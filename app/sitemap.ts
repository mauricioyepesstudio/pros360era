import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = brand.website;

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/profesionales`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/aplicar-profesional`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
