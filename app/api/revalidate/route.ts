import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getEnabledCities, getCityOrNull } from "@/lib/cities/registry";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const citySlug = searchParams.get("city");
  const authHeader = request.headers.get("authorization");
  const expected = process.env.REVALIDATE_SECRET;
  const cronSecret = process.env.CRON_SECRET;

  const authorizedBySecret = Boolean(expected && secret === expected);
  const authorizedByCron = Boolean(
    cronSecret && authHeader === `Bearer ${cronSecret}`,
  );

  if (!authorizedBySecret && !authorizedByCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (citySlug) {
    const city = getCityOrNull(citySlug);
    if (!city?.enabled) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    const tag = `eczaneler:${citySlug}`;
    revalidateTag(tag, "max");

    return NextResponse.json({
      revalidated: true,
      tag,
      at: new Date().toISOString(),
    });
  }

  const tags = getEnabledCities().map((city) => `eczaneler:${city.slug}`);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({
    revalidated: true,
    tags,
    at: new Date().toISOString(),
  });
}
