import { bursaConfig } from "@/lib/cities/bursa/config";
import type { CityConfig, CitySummary } from "@/lib/cities/types";

export const CITIES: Record<string, CityConfig> = {
  [bursaConfig.slug]: bursaConfig,
};

export function getCityOrNull(slug: string): CityConfig | null {
  return CITIES[slug] ?? null;
}

export function getCity(slug: string): CityConfig {
  const city = getCityOrNull(slug);
  if (!city) {
    throw new Error(`Unknown city: ${slug}`);
  }
  return city;
}

export function getEnabledCities(): CityConfig[] {
  return Object.values(CITIES).filter((city) => city.enabled);
}

export function getEnabledCitySummaries(): CitySummary[] {
  return getEnabledCities().map(({ id, name, slug }) => ({ id, name, slug }));
}

export function isEnabledCity(slug: string): boolean {
  const city = getCityOrNull(slug);
  return city?.enabled ?? false;
}
