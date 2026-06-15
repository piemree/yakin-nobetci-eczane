import { getCity, getCityOrNull } from "@/lib/cities/registry";
import { stripNobetciSuffix } from "./slug";
import type { Ilce, Mahalle, Scope } from "./types";

/** BEO nöbet bölgeleri aynı ilçeyi birden fazla satırda tutabiliyor; UI için tekilleştir. */
export function getUniqueIlceler(citySlug: string): Ilce[] {
  const city = getCity(citySlug);
  const seen = new Set<string>();
  return city.ilceler.filter((ilce) => {
    if (seen.has(ilce.id)) return false;
    seen.add(ilce.id);
    return true;
  });
}

function buildCityMaps(citySlug: string) {
  const city = getCity(citySlug);
  return {
    ilceBySlug: new Map(city.ilceler.map((ilce) => [ilce.slug, ilce])),
    ilceById: new Map(city.ilceler.map((ilce) => [ilce.id, ilce])),
    mahalleBySlug: new Map(city.mahalleler.map((mahalle) => [mahalle.slug, mahalle])),
    ilceler: city.ilceler,
    mahalleler: city.mahalleler,
  };
}

export function resolveScopeFromSlug(
  citySlug: string,
  rawSlug: string,
): Scope | null {
  const city = getCityOrNull(citySlug);
  if (!city) return null;

  const { ilceBySlug, ilceById, mahalleBySlug, ilceler, mahalleler } =
    buildCityMaps(citySlug);
  const base = stripNobetciSuffix(rawSlug);

  const ilce =
    ilceBySlug.get(`${base}-nobetci-eczane`) ??
    ilceById.get(base) ??
    ilceler.find((item) => item.id === base);

  if (ilce) {
    return {
      type: "district",
      label: ilce.name,
      district: ilce.name,
    };
  }

  const mahalle =
    mahalleBySlug.get(`${base}-nobetci-eczane`) ??
    mahalleBySlug.get(rawSlug) ??
    mahalleler.find((item) => stripNobetciSuffix(item.slug) === base);

  if (mahalle) {
    return {
      type: "mahalle",
      label: mahalle.name.replace(/ Mahallesi$/i, ""),
      district: mahalle.district,
      mahalle,
    };
  }

  return null;
}

export function getAllStaticSlugs(citySlug: string): string[] {
  const city = getCity(citySlug);
  const ilceSlugs = city.ilceler.map((ilce) => ilce.slug);
  const mahalleSlugs = city.mahalleler.map((mahalle) => mahalle.slug);
  return [...new Set([...ilceSlugs, ...mahalleSlugs])];
}

export function getSearchItems(citySlug: string) {
  const city = getCity(citySlug);
  return [
    ...city.ilceler.map((ilce) => ({
      type: "district" as const,
      label: ilce.name,
      subtitle: "İlçe",
      href: `/${citySlug}/${ilce.slug}`,
      keywords: [ilce.name, ilce.dutyZone ?? ""],
    })),
    ...city.mahalleler.map((mahalle) => ({
      type: "mahalle" as const,
      label: mahalle.name.replace(/ Mahallesi$/i, ""),
      subtitle: mahalle.district,
      href: `/${citySlug}/${mahalle.slug}`,
      keywords: [mahalle.name, mahalle.district],
    })),
  ];
}
