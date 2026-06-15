import { bursaMeta } from "@/lib/cities/bursa/meta";
import { scrapeBursaEczaneler } from "@/lib/cities/bursa/scrape";
import type { CityConfig } from "@/lib/cities/types";

export const bursaConfig: CityConfig = {
  ...bursaMeta,
  scrape: scrapeBursaEczaneler,
};
