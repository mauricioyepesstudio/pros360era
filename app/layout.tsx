import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { brand } from "@/config/brand";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: brand.displayName,
  description: brand.description,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans text-slate-950">
        {children}
      </body>
    </html>
  );
}
