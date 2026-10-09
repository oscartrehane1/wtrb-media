import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://wtrbmedia.co.uk"),
  title: {
    default: "WtRB Media | Outdoor Film & Photography Production",
    template: "%s | WtRB Media",
  },
  description: "Cinematic outdoor film production and commercial photography for adventure brands, tourism destinations and outdoor experiences across the UK and internationally.",
  alternates: { canonical: "/" },
  keywords: ["outdoor film production", "outdoor videographer UK", "commercial outdoor photography", "tourism film production", "adventure brand videography"],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "WtRB Media",
    title: "WtRB Media — Stories Made Outside",
    description: "Outdoor film and photography production for brands, destinations and experiences.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "WtRB Media — Stories Made Outside" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WtRB Media — Stories Made Outside",
    description: "Outdoor film and photography production for brands, destinations and experiences.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
