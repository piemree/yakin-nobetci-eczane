import { formatTurkishDate, getTodayIso } from "./date";
import { getCity, isEnabledCity } from "@/lib/cities/registry";
import type { Eczane, NobetciData } from "./types";

export async function getNobetciEczaneler(citySlug: string): Promise<NobetciData> {
  if (!isEnabledCity(citySlug)) {
    throw new Error(`City not available: ${citySlug}`);
  }

  const city = getCity(citySlug);
  const eczaneler = await city.scrape();

  return {
    eczaneler,
    date: getTodayIso(),
    dateLabel: formatTurkishDate(),
    fetchedAt: new Date().toISOString(),
    city: citySlug,
    cityName: city.name,
  };
}

export function filterEczanelerByDistrict(
  eczaneler: Eczane[],
  district: string,
): Eczane[] {
  const normalized = district.toLowerCase();
  return eczaneler.filter(
    (eczane) =>
      eczane.district.toLowerCase() === normalized ||
      eczane.dutyZone.toLowerCase().includes(normalized),
  );
}
