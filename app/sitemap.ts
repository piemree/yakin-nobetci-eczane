import type { MetadataRoute } from "next";
import { getEnabledCities } from "@/lib/cities/registry";
import { getAllStaticSlugs } from "@/lib/data";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bursa-en-yakin-eczane.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  for (const city of getEnabledCities()) {
    entries.push({
      url: `${siteUrl}/${city.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    });

    entries.push({
      url: `${siteUrl}/${city.slug}/en-yakin-nobetci-eczane`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });

    for (const slug of getAllStaticSlugs(city.slug)) {
      entries.push({
        url: `${siteUrl}/${city.slug}/${slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  return entries;
}
