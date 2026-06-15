import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nöbetçi Eczane",
    short_name: "Nöbetçi Eczane",
    description:
      "Türkiye'de en yakın nöbetçi eczaneyi harita ve konum ile bul.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#059669",
    lang: "tr",
    icons: [
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
