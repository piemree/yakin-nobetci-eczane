import ilcelerData from "@/data/bursa/ilceler.json";
import mahallelerData from "@/data/bursa/mahalleler.json";
import type { CityMeta } from "@/lib/cities/types";
import type { Ilce, Mahalle } from "@/lib/types";

export const bursaMeta: CityMeta = {
  id: "bursa",
  name: "Bursa",
  slug: "bursa",
  enabled: true,
  sourceUrl: "https://www.beo.org.tr/nobetci-eczaneler",
  sourceName: "Bursa Eczacı Odası",
  ilceler: ilcelerData as Ilce[],
  mahalleler: mahallelerData as Mahalle[],
};
