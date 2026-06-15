import type { Eczane, Scope } from "@/lib/types";

interface JsonLdProps {
  title: string;
  description: string;
  url: string;
  eczaneler: Eczane[];
  cityName?: string;
  scope?: Scope;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function JsonLd({
  title,
  description,
  url,
  eczaneler,
  cityName = "Türkiye",
  scope,
  breadcrumbs = [],
}: JsonLdProps) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    description,
    url,
    numberOfItems: eczaneler.length,
    itemListElement: eczaneler.map((eczane, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Pharmacy",
        name: eczane.name,
        telephone: eczane.phones[0],
        address: {
          "@type": "PostalAddress",
          streetAddress: eczane.address,
          addressLocality: eczane.district,
          addressRegion: cityName,
          addressCountry: "TR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: eczane.lat,
          longitude: eczane.lng,
        },
        openingHours: `${eczane.dutyStart} - ${eczane.dutyEnd}`,
        url: eczane.mapsUrl,
      },
    })),
  };

  const breadcrumbList =
    breadcrumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: crumb.url,
          })),
        }
      : null;

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    about: scope?.label ?? `${cityName} nöbetçi eczane`,
  };

  const payloads = [webPage, itemList, breadcrumbList].filter(Boolean);

  return (
    <>
      {payloads.map((payload, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
        />
      ))}
    </>
  );
}
