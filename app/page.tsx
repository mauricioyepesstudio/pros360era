import Navbar from "@/components/layout/Navbar";
import Hero from "@/sections/home/Hero";
import Benefits from "@/sections/home/Benefits";
import Services from "@/sections/home/Services";
import Process from "@/sections/home/Process";
import Testimonials from "@/sections/home/Testimonials";
import FAQ from "@/sections/home/FAQ";
import CTA from "@/sections/home/CTA";
import Footer from "@/sections/home/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50 text-slate-950">
        <Hero />
        <Benefits />
        <Services />
        <Process />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </>
  );
}