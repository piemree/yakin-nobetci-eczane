import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { EczaneSeoList } from "@/components/EczaneSeoList";
import { MapExplorerClient } from "@/components/MapExplorerClient";
import { DistrictPicker } from "@/components/DistrictPicker";
import { getEnabledCities, getCityOrNull } from "@/lib/cities/registry";
import { getAllStaticSlugs, resolveScopeFromSlug } from "@/lib/data";
import { formatTurkishDate } from "@/lib/date";
import { filterEczanelerByDistrict, getNobetciEczaneler } from "@/lib/scrape";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bursa-en-yakin-eczane.vercel.app";

export const dynamicParams = true;

type PageProps = {
  params: Promise<{ city: string; slug: string }>;
};

export async function generateStaticParams() {
  return getEnabledCities().flatMap((city) =>
    getAllStaticSlugs(city.slug).map((slug) => ({
      city: city.slug,
      slug,
    })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug, slug } = await params;
  const city = getCityOrNull(citySlug);
  if (!city?.enabled) {
    return { title: "Sayfa bulunamadı" };
  }

  const scope = resolveScopeFromSlug(citySlug, slug);
  if (!scope) {
    return { title: "Sayfa bulunamadı" };
  }

  const dateLabel = formatTurkishDate();
  const title = `${scope.label} Nöbetçi Eczane - ${dateLabel}`;

  const description =
    scope.type === "mahalle"
      ? `${scope.label} (${scope.district}) için bugün nöbetçi eczaneler. Konumuna göre en yakın eczaneyi harita ve yol tarifi ile bul.`
      : `${scope.label} ilçesinde bugün nöbetçi eczaneler. Açık eczane listesi, harita ve en yakın sıralama.`;

  return {
    title,
    description,
    keywords: [
      `${scope.label} nöbetçi eczane`,
      `${scope.label} nöbetçi`,
      `nöbetçi eczane ${city.name.toLowerCase()}`,
      "açık eczane",
      scope.district ?? scope.label,
    ],
    alternates: {
      canonical: `${siteUrl}/${citySlug}/${slug}`,
    },
  };
}

export default async function SlugPage({ params }: PageProps) {
  const { city: citySlug, slug } = await params;
  const city = getCityOrNull(citySlug);
  if (!city?.enabled) notFound();

  const scope = resolveScopeFromSlug(citySlug, slug);
  if (!scope) notFound();

  const data = await getNobetciEczaneler(citySlug);
  const eczaneler =
    scope.type === "district" && scope.district
      ? filterEczanelerByDistrict(data.eczaneler, scope.district)
      : scope.type === "mahalle" && scope.district
        ? filterEczanelerByDistrict(data.eczaneler, scope.district)
        : data.eczaneler;

  const pageUrl = `${siteUrl}/${citySlug}/${slug}`;
  const title = `${scope.label} Nöbetçi Eczane - ${data.dateLabel}`;

  return (
    <>
      <JsonLd
        title={title}
        description={`${scope.label} için bugün nöbetçi eczane listesi.`}
        url={pageUrl}
        eczaneler={eczaneler}
        scope={scope}
        cityName={city.name}
        breadcrumbs={[
          { name: "Ana Sayfa", url: siteUrl },
          { name: city.name, url: `${siteUrl}/${citySlug}` },
          { name: scope.label, url: pageUrl },
        ]}
      />
      <EczaneSeoList eczaneler={eczaneler} />

      <section className="space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 md:rounded-3xl md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 md:text-sm">
            {data.dateLabel}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 md:mt-2 md:text-3xl">
            {scope.label} Nöbetçi Eczane
          </h1>
          {scope.type === "mahalle" && scope.district && (
            <p className="mt-1 text-sm text-zinc-600">{scope.district} ilçesi</p>
          )}
          <p className="mt-2 hidden text-zinc-600 md:block">
            Bugün {scope.label} bölgesinde nöbetçi {eczaneler.length} eczane
            bulundu.
          </p>
          <div className="mt-4">
            <DistrictPicker citySlug={citySlug} />
          </div>
        </div>

        <div className="-mx-4 md:mx-0">
          <MapExplorerClient
            eczaneler={eczaneler}
            scope={scope}
            className="map-explorer--page"
          />
        </div>
      </section>
    </>
  );
}
