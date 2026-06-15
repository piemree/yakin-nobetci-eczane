import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityOrNull } from "@/lib/cities/registry";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bursa-en-yakin-eczane.vercel.app";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ city: string }>;
};

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityOrNull(citySlug);

  if (!city?.enabled) {
    return { title: "Sayfa bulunamadı" };
  }

  return {
    title: {
      default: `${city.name} Nöbetçi Eczane | En Yakın Nöbetçi Eczaneler`,
      template: `%s | ${city.name} Nöbetçi Eczane`,
    },
  };
}

export default async function CityLayout({ children, params }: LayoutProps) {
  const { city: citySlug } = await params;
  const city = getCityOrNull(citySlug);

  if (!city?.enabled) {
    notFound();
  }

  return (
    <>
      {children}
      <footer className="hidden border-t border-zinc-200 bg-white py-6 text-center text-sm text-zinc-500 md:block">
        Veriler{" "}
        <a
          href={city.sourceUrl}
          className="font-medium text-emerald-700 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {city.sourceName}
        </a>{" "}
        resmi yayınından alınır ve her gün güncellenir.
      </footer>
    </>
  );
}
