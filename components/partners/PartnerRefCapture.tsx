"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { persistPartnerRef } from "@/lib/partners/capture";
import { normalizePartnerRef } from "@/lib/partners/ref";

/** Records only a configured partner slug; navigation updates refresh attribution. */
export default function PartnerRefCapture({ slug }: { slug?: string }) {
  const searchParams = useSearchParams();
  const ref = normalizePartnerRef(searchParams.get("ref")) ?? normalizePartnerRef(slug);
  useEffect(() => { persistPartnerRef(ref); }, [ref]);
  return null;
}
