"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getClientCity } from "@/lib/cities/client";

export function SiteHeader() {
  const pathname = usePathname();
  const citySlug = pathname.split("/").filter(Boolean)[0] ?? null;
  const city = citySlug ? getClientCity(citySlug) : null;
  const activeCity = city;

  return (
    <header
      id="site-header"
      className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:gap-4 md:py-4">
        <Link
          href={activeCity ? `/${activeCity.slug}` : "/"}
          className="min-w-0 truncate text-base font-bold text-zinc-900 md:text-lg"
        >
          {activeCity ? `${activeCity.name} Nöbetçi Eczane` : "Nöbetçi Eczane"}
        </Link>
        <nav className="flex shrink-0 items-center gap-2 text-sm font-medium md:gap-3">
          {activeCity ? (
            <>
              <Link
                href={`/${activeCity.slug}`}
                className="whitespace-nowrap text-zinc-600 hover:text-zinc-900"
              >
                Tüm Liste
              </Link>
              <Link
                href={`/${activeCity.slug}/en-yakin-nobetci-eczane`}
                className="whitespace-nowrap rounded-full bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700 md:px-4 md:py-2"
              >
                En Yakınım
              </Link>
            </>
          ) : (
            <Link
              href="/"
              className="whitespace-nowrap text-zinc-600 hover:text-zinc-900"
            >
              Şehir Seç
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
