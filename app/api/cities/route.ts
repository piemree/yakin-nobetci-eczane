import { NextResponse } from "next/server";
import { getEnabledCitySummaries } from "@/lib/cities/registry";

export async function GET() {
  const cities = getEnabledCitySummaries();

  return NextResponse.json(
    { cities },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
