import { bursaMeta } from "@/lib/cities/bursa/meta";
import type { CityMeta } from "@/lib/cities/types";

const ALL_CITY_META: CityMeta[] = [bursaMeta];

export function getClientCity(slug: string): CityMeta | null {
  const city = ALL_CITY_META.find((item) => item.slug === slug);
  return city?.enabled ? city : null;
}
