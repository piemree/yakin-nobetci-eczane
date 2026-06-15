import { NextResponse } from "next/server";
import { getCityOrNull } from "@/lib/cities/registry";
import { getNobetciEczaneler } from "@/lib/scrape";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city");

  if (!citySlug) {
    return NextResponse.json(
      { error: "city parametresi gerekli." },
      { status: 400 },
    );
  }

  const city = getCityOrNull(citySlug);
  if (!city) {
    return NextResponse.json(
      { error: "Bilinmeyen şehir." },
      { status: 404 },
    );
  }

  if (!city.enabled) {
    return NextResponse.json(
      { error: "Bu şehir henüz kullanılamıyor." },
      { status: 404 },
    );
  }

  try {
    const data = await getNobetciEczaneler(citySlug);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Nöbetçi eczane verisi alınamadı.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
