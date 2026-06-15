import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnYakinView } from "@/components/EnYakinView";
import { EczaneSeoList } from "@/components/EczaneSeoList";
import { JsonLd } from "@/components/JsonLd";
import { getEnabledCities, getCityOrNull } from "@/lib/cities/registry";
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
    title: `En Yakın Nöbetçi Eczane - ${city.name} | Konumuna Göre`,
    description: `${city.name}'da sana en yakın nöbetçi eczaneyi bul. Konumunu paylaş, en yakın açık eczaneyi harita ve yol tarifi ile gör.`,
    keywords: [
      "en yakın nöbetçi eczane",
      "bana en yakın nöbetçi eczane",
      "yakınımdaki nöbetçi eczane",
      `${city.name.toLowerCase()} açık eczane`,
    ],
    alternates: {
      canonical: `${siteUrl}/${citySlug}/en-yakin-nobetci-eczane`,
    },
  };
}

export default async function EnYakinPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = getCityOrNull(citySlug);
  if (!city?.enabled) notFound();

  const data = await getNobetciEczaneler(citySlug);
  const pageUrl = `${siteUrl}/${citySlug}/en-yakin-nobetci-eczane`;

  return (
    <>
      <JsonLd
        title={`En Yakın Nöbetçi Eczane - ${city.name}`}
        description={`Konumuna göre ${city.name}'daki en yakın nöbetçi eczaneyi bul.`}
        url={pageUrl}
        eczaneler={data.eczaneler}
        cityName={city.name}
        breadcrumbs={[
          { name: "Ana Sayfa", url: siteUrl },
          { name: city.name, url: `${siteUrl}/${citySlug}` },
          { name: "En Yakın Nöbetçi Eczane", url: pageUrl },
        ]}
      />
      <EczaneSeoList eczaneler={data.eczaneler} />
      <EnYakinView
        eczaneler={data.eczaneler}
        citySlug={citySlug}
        cityName={city.name}
      />
    </>
  );
}
