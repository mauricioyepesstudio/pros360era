"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

const links = [
  { label: "Inicio", href: "#home" },
  { label: "Servicios", href: "#services" },
  { label: "Proceso", href: "#process" },
  { label: "Testimonios", href: "#testimonials" },
  { label: "Contacto", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-xl border-b border-slate-200"
          : "bg-transparent"
      }`}
    >
      <Container className="flex h-24 items-center justify-between">
        {/* LOGO */}

        <a
          href="#home"
          className="text-3xl font-extrabold tracking-tight transition-colors duration-300"
        >
          <span
            className={
              scrolled ? "text-[#0D1B3D]" : "text-white"
            }
          >
            PROS
          </span>

          <span className="text-[#D4A23A]">
            360
          </span>

          <span
            className={
              scrolled ? "text-[#0D1B3D]" : "text-white"
            }
          >
            ERA
          </span>
        </a>

        {/* MENU */}

        <nav className="hidden items-center gap-10 lg:flex">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`font-medium transition-colors duration-300 ${
                scrolled
                  ? "text-slate-700 hover:text-[#D4A23A]"
                  : "text-white hover:text-[#D4A23A]"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* BOTON */}

        <a
          href="https://wa.me/17866041733"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>
            Agenda Gratis
          </Button>
        </a>
      </Container>
    </header>
  );
}