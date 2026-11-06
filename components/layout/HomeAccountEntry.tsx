import Link from "next/link";

/** One login; the authenticated server resolves the account's actual role. */
export default function HomeAccountEntry() {
  return <Link data-tour="hero-login" href="/login" className="relative z-10 inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-white px-4 text-sm font-bold text-[var(--brand-navy)] shadow-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4">Ya tengo cuenta</Link>;
}
