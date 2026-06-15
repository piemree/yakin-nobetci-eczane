import type { Eczane, Ilce, Mahalle } from "@/lib/types";

export interface CityMeta {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  sourceUrl: string;
  sourceName: string;
  ilceler: Ilce[];
  mahalleler: Mahalle[];
}

export interface CityConfig extends CityMeta {
  scrape: () => Promise<Eczane[]>;
}

export interface CitySummary {
  id: string;
  name: string;
  slug: string;
}
