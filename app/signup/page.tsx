import Link from "next/link";import BrandMark from "@/components/evolusa/BrandMark";import AuthFoundation from "@/components/account/AuthFoundation";
export default function SignupPage(){return <main className="min-h-screen bg-[var(--warm-canvas)] px-5 py-8"><div className="mx-auto mb-8 max-w-md"><Link href="/"><BrandMark size="md"/></Link></div><AuthFoundation mode="signup"/></main>}
