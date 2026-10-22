"use client";
import { useEffect } from "react";
import { persistPartnerRef } from "@/lib/partners/capture";

/**
 * Guarda la atribución del aliado (cookie propia, 30 días) cuando la visita
 * llega con ?ref=<slug> o desde /aliados/<slug>. Valores desconocidos se
 * ignoran. No renderiza nada.
 */
export default function PartnerRefCapture({ slug }: { slug?: string }) {
  useEffect(() => {
    let queryRef: string | null = null;
    try { queryRef = new URLSearchParams(window.location.search).get("ref"); } catch { /* URL no disponible */ }
    persistPartnerRef(queryRef ?? slug ?? null);
  }, [slug]);
  return null;
}
