import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import GrainOverlay from "@/components/ui/GrainOverlay";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Nav from "@/components/ui/Nav";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE = "https://veracoffeeexport.com"; // VERIFY final domain

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Vera Coffee Export — Ethiopian specialty green coffee exporter",
    template: "%s · Vera Coffee Export",
  },
  description:
    "Specialty green coffee exported from Ethiopia — Yirgacheffe, Sidamo, Guji and Harrar. " +
    "Traceable lots, G1 grades, FOB Djibouti. Request a sample.",
  keywords: [
    "Ethiopian green coffee",
    "green coffee exporter",
    "Yirgacheffe",
    "Sidamo",
    "Guji",
    "Harrar",
    "specialty coffee importer",
    "FOB Djibouti",
  ],
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Vera Coffee Export",
    title: "Vera Coffee Export — Ethiopian specialty green coffee",
    description:
      "Specialty Ethiopian green coffee, traceable to the washing station. Request a sample.",
    images: [{ url: "/img/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vera Coffee Export",
    description: "Ethiopian specialty green coffee. Request a sample.",
    images: ["/img/og.jpg"],
  },
  robots: { index: true, follow: true },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vera Coffee Export",
  url: SITE,
  description:
    "Exporter of specialty Ethiopian green coffee from Yirgacheffe, Sidamo, Guji and Harrar.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Addis Ababa",
    addressCountry: "ET",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-fg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent-solid focus:text-fg focus:px-4 focus:py-2 focus:font-medium"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <GrainOverlay />
        <Nav />
        {children}
      </body>
    </html>
  );
}
