import * as cheerio from "cheerio";
import type { Eczane } from "@/lib/types";

const BEO_URL = "https://www.beo.org.tr/nobetci-eczaneler";

const DISTRICT_MAP: Record<string, string> = {
  MERKEZ: "Merkez",
  "NİLÜFER": "Nilüfer",
  "NILÜFER": "Nilüfer",
  OSMANGAZİ: "Osmangazi",
  OSMANGAZI: "Osmangazi",
  YILDIRIM: "Yıldırım",
  BÜYÜKORHAN: "Büyükorhan",
  BUYUKORHAN: "Büyükorhan",
  GEMLİK: "Gemlik",
  GEMLIK: "Gemlik",
  GÜRSU: "Gürsu",
  GURSU: "Gürsu",
  HARMANCIK: "Harmancık",
  İNEGÖL: "İnegöl",
  INEGOL: "İnegöl",
  İZNİK: "İznik",
  IZNIK: "İznik",
  KARACABEY: "Karacabey",
  KELES: "Keles",
  KESTEL: "Kestel",
  MUDANYA: "Mudanya",
  MUSTAFAKEMALPAŞA: "Mustafakemalpaşa",
  MUSTAFAKEMALPASA: "Mustafakemalpaşa",
  ORHANELİ: "Orhaneli",
  ORHANELI: "Orhaneli",
  ORHANGAZİ: "Orhangazi",
  ORHANGAZI: "Orhangazi",
  YENİŞEHİR: "Yenişehir",
  YENISEHIR: "Yenişehir",
};

function normalizeDistrictLabel(label: string): string {
  const upper = label.trim().toUpperCase();
  const main = upper.split(" - ")[0]?.trim() ?? upper;
  return DISTRICT_MAP[main] ?? titleCase(main);
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parsePhones(
  $: cheerio.CheerioAPI,
  container: ReturnType<cheerio.CheerioAPI>,
) {
  const phones: string[] = [];
  container.find('a[href^="tel:"]').each((_, el) => {
    const phone = $(el).text().replace(/\s+/g, " ").trim();
    if (phone) phones.push(phone);
  });
  return phones;
}

function parseCoordinates(
  mapsHref: string | undefined,
): { lat: number; lng: number } | null {
  if (!mapsHref) return null;
  const match = mapsHref.match(/q=([-\d.]+),([-\d.]+)/);
  if (!match) return null;
  return { lat: Number(match[1]), lng: Number(match[2]) };
}

function parseAddressBlock(html: string): { address: string; landmark: string } {
  const withoutPhones = html.replace(
    /<a[^>]*href="tel:[^"]*"[^>]*>.*?<\/a>/gi,
    "",
  );
  const parts = cheerio
    .load(`<div>${withoutPhones}</div>`)("div")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const landmarkMatch = parts.match(/\(([^)]+)\)/);
  const landmark = landmarkMatch?.[1]?.trim() ?? "";
  const address = parts.replace(/\([^)]+\)/, "").trim();
  return { address, landmark };
}

export function parseNobetciHtml(html: string): Eczane[] {
  const $ = cheerio.load(html);
  const eczaneler: Eczane[] = [];

  $(".nobetci").each((index, element) => {
    const block = $(element);
    const heading = block.find("h4").first().text().replace(/\s+/g, " ").trim();
    const [namePart, zonePart] = heading.split(" - ");
    const name = namePart?.replace(/\s+/g, " ").trim();
    const dutyZone = zonePart?.trim() ?? "";
    if (!name) return;

    const district = normalizeDistrictLabel(dutyZone || name);
    const addressHtml = block.find(".fa-home").first().parent().html() ?? "";
    const { address, landmark } = parseAddressBlock(addressHtml);
    const phones = parsePhones($, block);
    const mapsHref = block.find('a[href*="google.com/maps"]').attr("href");
    const coords = parseCoordinates(mapsHref);
    if (!coords) return;

    const dutyText = block
      .find("span.red")
      .first()
      .text()
      .replace(/\s+/g, " ")
      .trim();
    const [dutyStart = "", dutyEnd = ""] = dutyText
      .split("/")
      .map((part) => part.trim());

    const id = `${slugifyName(name)}-${index}`;

    eczaneler.push({
      id,
      name,
      district,
      dutyZone: dutyZone || district.toUpperCase(),
      address,
      landmark,
      phones,
      lat: coords.lat,
      lng: coords.lng,
      dutyStart,
      dutyEnd,
      mapsUrl:
        mapsHref ??
        `https://www.google.com/maps?q=${coords.lat},${coords.lng}`,
    });
  });

  return eczaneler;
}

export async function scrapeBursaEczaneler(): Promise<Eczane[]> {
  const response = await fetch(BEO_URL, {
    next: {
      revalidate: 1800,
      tags: ["eczaneler:bursa"],
    },
    headers: {
      "User-Agent":
        "NobetciEczaneBot/1.0 (+https://bursa-en-yakin-eczane.vercel.app)",
      Accept: "text/html",
    },
  });

  if (!response.ok) {
    throw new Error(`BEO fetch failed: ${response.status}`);
  }

  const html = await response.text();
  return parseNobetciHtml(html);
}
