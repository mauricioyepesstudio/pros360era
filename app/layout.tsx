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
  metadataBase: new URL(brand.website),
  title: {
    default: `${brand.displayName} — ${brand.tagline}`,
    template: `%s | ${brand.displayName}`,
  },
  description: brand.description,
  keywords: [
    "inmigrantes hispanos Estados Unidos",
    "orientación inmigrantes USA",
    "profesionales hispanohablantes USA",
    "emprender en Estados Unidos",
    "notario hispano Florida",
  ],
  openGraph: {
    title: brand.displayName,
    description: brand.description,
    url: brand.website,
    siteName: brand.displayName,
    locale: "es_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: brand.displayName,
    description: brand.description,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.displayName,
  legalName: brand.legalName,
  url: brand.website,
  email: brand.email,
  telephone: brand.phone.href.replace("tel:", ""),
  description: brand.description,
  inLanguage: "es-US",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans text-slate-950">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
