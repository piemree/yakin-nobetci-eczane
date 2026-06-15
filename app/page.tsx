import type { Metadata } from "next";
import Link from "next/link";
import { getEnabledCities } from "@/lib/cities/registry";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bursa-en-yakin-eczane.vercel.app";

export const metadata: Metadata = {
  title: "Nöbetçi Eczane | Şehir Seçin",
  description:
    "Türkiye'de nöbetçi eczaneleri harita ve konumuna göre bul. Şehrini seçerek güncel nöbetçi eczane listesine ulaş.",
  alternates: {
    canonical: siteUrl,
  },
};

export default function HomePage() {
  const cities = getEnabledCities();

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 md:rounded-3xl md:p-8">
        <h1 className="text-2xl font-bold text-zinc-900 md:text-4xl">
          Nöbetçi Eczane
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-600">
          Bugün nöbetçi eczaneleri harita üzerinde gör, konumuna göre en yakından
          başlayarak sırala veya ilçe/mahalle ara. Başlamak için şehrini seç.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <Link
            key={city.slug}
            href={`/${city.slug}`}
            className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 transition hover:ring-emerald-500 md:p-6"
          >
            <h2 className="text-xl font-bold text-zinc-900 group-hover:text-emerald-700">
              {city.name}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              {city.name} nöbetçi eczaneleri
            </p>
            <span className="mt-3 inline-flex text-sm font-semibold text-emerald-700">
              Listeyi gör →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
