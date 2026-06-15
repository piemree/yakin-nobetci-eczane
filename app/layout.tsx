import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bursa-en-yakin-eczane.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nöbetçi Eczane | En Yakın Nöbetçi Eczaneler",
    template: "%s | Nöbetçi Eczane",
  },
  description:
    "Türkiye'de nöbetçi eczaneleri harita ve konumuna göre en yakından başlayarak bul. Şehrini seçerek güncel nöbetçi eczane listesine ulaş.",
  applicationName: "Nöbetçi Eczane",
  keywords: [
    "nöbetçi eczane",
    "en yakın nöbetçi eczane",
    "açık eczane",
    "nöbetçi eczane harita",
  ],
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      {
        url: "/favicon/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#dc2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-900">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 py-4 md:py-8">{children}</main>
      </body>
    </html>
  );
}
