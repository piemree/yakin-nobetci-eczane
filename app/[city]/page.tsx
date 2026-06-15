import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { EczaneSeoList } from "@/components/EczaneSeoList";
import { MapExplorerClient } from "@/components/MapExplorerClient";
import { DistrictPicker } from "@/components/DistrictPicker";
import { getEnabledCities, getCityOrNull } from "@/lib/cities/registry";
import { formatTurkishDate } from "@/lib/date";
import { getNobetciEczaneler } from "@/lib/scrape";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bursa-en-yakin-eczane.vercel.app";

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateStaticParams() {
  return getEnabledCities().map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityOrNull(citySlug);
  if (!city?.enabled) {
    return { title: "Sayfa bulunamadı" };
  }

  return {
    title: `${city.name} Nöbetçi Eczane`,
    description: `${city.name}'da bugün nöbetçi eczaneleri harita ve konumuna göre en yakından başlayarak bul. Resmi ${city.sourceName} verileriyle güncel liste.`,
    alternates: {
      canonical: `${siteUrl}/${citySlug}`,
    },
  };
}

export default async function CityHomePage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityOrNull(citySlug);
  if (!city?.enabled) notFound();

  const data = await getNobetciEczaneler(citySlug);
  const pageUrl = `${siteUrl}/${citySlug}`;
  const title = `${city.name} Nöbetçi Eczane - ${formatTurkishDate()}`;

  return (
    <>
      <JsonLd
        title={title}
        description={`${city.name}'da bugün nöbetçi eczaneler listesi, harita ve konuma göre en yakın sıralama.`}
        url={pageUrl}
        eczaneler={data.eczaneler}
        cityName={city.name}
        breadcrumbs={[
          { name: "Ana Sayfa", url: siteUrl },
          { name: city.name, url: pageUrl },
        ]}
      />
      <EczaneSeoList eczaneler={data.eczaneler} />

      <section className="space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 md:rounded-3xl md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 md:text-sm">
            {data.dateLabel}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 md:mt-2 md:text-4xl">
            {city.name} Nöbetçi Eczane
          </h1>
          <p className="mt-2 hidden text-zinc-600 md:block">
            Bugün {city.name}&apos;da nöbetçi eczaneleri harita üzerinde gör,
            konumuna göre en yakından başlayarak sırala veya mahalle/ilçe ara.
          </p>

          <div className="mt-4 space-y-3">
            <DistrictPicker citySlug={citySlug} />
            <Link
              href={`/${citySlug}/en-yakin-nobetci-eczane`}
              className="inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              En yakın nöbetçi eczaneyi bul
            </Link>
          </div>
        </div>

        <div className="-mx-4 md:mx-0">
          <MapExplorerClient
            eczaneler={data.eczaneler}
            scope={{ type: "all", label: city.name }}
            className="map-explorer--page"
          />
        </div>
      </section>
    </>
  );
}
