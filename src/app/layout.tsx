import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://wtrbmedia.co.uk"),
  title: {
    default: "WtRB Media | Creative Production & Content Marketing",
    template: "%s | WtRB Media",
  },
  description: "Strategy-led filmmaking, photography and content marketing for travel, tourism, outdoor and adventure brands. From creative concepts to coordinated campaigns.",
  alternates: { canonical: "/" },
  keywords: ["creative production studio", "content marketing studio", "tourism film production", "outdoor brand filmmaking", "travel content campaigns"],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "WtRB Media",
    title: "WtRB Media — Creative Production & Content Marketing",
    description: "Film-led marketing for travel, outdoor and experience-led brands.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "WtRB Media — Stories worth watching. Campaigns built to work." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WtRB Media — Creative Production & Content Marketing",
    description: "Film-led marketing for travel, outdoor and experience-led brands.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
