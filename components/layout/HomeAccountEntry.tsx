"use client";
import Link from "next/link";
export default function HomeAccountEntry() { return (
        <details data-tour="hero-login" className="relative z-10 w-fit" onKeyDown={(event) => { if (event.key === "Escape") event.currentTarget.open = false; }}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-full bg-white px-4 text-sm font-bold text-[var(--brand-navy)] shadow-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4">Ya tengo cuenta</summary>
          <div className="absolute left-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--border)] bg-white p-2 text-[var(--brand-navy)] shadow-lg">
            <Link href="/login?next=%2Fdashboard" className="block rounded-lg px-3 py-3 font-semibold hover:bg-[var(--sky-surface)]">Soy usuario<span className="mt-1 block text-xs font-normal">Roadmap y proceso personal</span></Link>
            <Link href="/login?next=%2Fdashboard%2Fprofessional" className="block rounded-lg px-3 py-3 font-semibold hover:bg-[var(--sky-surface)]">Soy profesional<span className="mt-1 block text-xs font-normal">Presentación privada o panel profesional</span></Link>
          </div>
        </details>
); }
