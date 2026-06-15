"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DistrictPicker } from "@/components/DistrictPicker";
import { MapExplorerClient } from "@/components/MapExplorerClient";
import { getUniqueIlceler } from "@/lib/data";
import { getDirectionsUrl, haversine } from "@/lib/geo";
import type { Eczane } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

interface EnYakinViewProps {
  eczaneler: Eczane[];
  citySlug: string;
  cityName: string;
}

export function EnYakinView({
  eczaneler,
  citySlug,
  cityName,
}: EnYakinViewProps) {
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "requesting" | "granted" | "denied" | "unavailable"
  >("idle");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("unavailable");
      return;
    }
    setGeoStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      const timer = window.setTimeout(() => setGeoStatus("unavailable"), 0);
      return () => window.clearTimeout(timer);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    );
  }, []);

  const nearest = useMemo(() => {
    if (!userLocation) return null;
    return [...eczaneler]
      .map((eczane) => ({
        ...eczane,
        distanceMeters: haversine(userLocation, {
          lat: eczane.lat,
          lng: eczane.lng,
        }),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
  }, [eczaneler, userLocation]);

  const fallbackScope = selectedDistrict
    ? {
        type: "district" as const,
        label: selectedDistrict,
        district: selectedDistrict,
      }
    : { type: "all" as const, label: cityName };

  return (
    <div className="space-y-3 md:space-y-4">
      <section className="rounded-2xl bg-linear-to-br from-emerald-600 to-emerald-800 p-3 text-white shadow-lg md:rounded-3xl md:p-6">
        <h1 className="text-xl font-bold md:text-3xl">
          En Yakın Nöbetçi Eczane
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-emerald-50 md:mt-2 md:text-base">
          Konumunu paylaşırsan bugün {cityName}&apos;da sana en yakın nöbetçi
          eczaneyi anında gösteririz.
        </p>

        {geoStatus === "requesting" && (
          <p className="mt-2 rounded-xl bg-white/10 px-3 py-2 text-sm md:mt-3">
            Konumun alınıyor...
          </p>
        )}

        {geoStatus === "denied" || geoStatus === "unavailable" ? (
          <div className="mt-2 space-y-2 rounded-xl bg-white/10 p-2.5 md:mt-3 md:space-y-3 md:p-4">
            <p className="text-xs text-emerald-50 md:text-sm">
              Konumunu paylaşamadıysan ilçeni seçerek nöbetçi eczaneleri
              görebilirsin.
            </p>
            <select
              value={selectedDistrict}
              onChange={(event) => setSelectedDistrict(event.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white px-3 py-2.5 text-sm text-zinc-900 md:px-4 md:py-3"
            >
              <option value="">İlçe seçin</option>
              {getUniqueIlceler(citySlug).map((ilce) => (
                <option key={ilce.id} value={ilce.name}>
                  {ilce.name}
                </option>
              ))}
            </select>
            <DistrictPicker
              citySlug={citySlug}
              selectClassName="border-white/20"
              buttonClassName="bg-white text-emerald-800 hover:bg-emerald-50"
            />
          </div>
        ) : null}

        {nearest && (
          <div className="mt-3 rounded-xl bg-white p-3 text-zinc-900 shadow-xl md:mt-4 md:rounded-2xl md:p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Sana en yakın nöbetçi eczane
            </p>
            <h2 className="mt-1 text-lg font-bold md:text-2xl">
              {nearest.name}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              {nearest.district} ·{" "}
              {nearest.distanceMeters < 1000
                ? `${Math.round(nearest.distanceMeters)} m`
                : `${(nearest.distanceMeters / 1000).toFixed(1)} km`}
            </p>
            <p className="mt-1 text-sm text-zinc-600 md:mt-2">
              {nearest.address}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 md:mt-3">
              <a
                href={getDirectionsUrl(nearest.lat, nearest.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 md:px-4 md:py-2.5"
              >
                En yakına git (Yol Tarifi)
              </a>
              {nearest.phones[0] && (
                <a
                  href={`tel:${nearest.phones[0].replace(/\s+/g, "")}`}
                  className="inline-flex rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 md:px-4 md:py-2.5"
                >
                  Ara
                </a>
              )}
            </div>
          </div>
        )}

        {geoStatus !== "granted" && (
          <button
            type="button"
            onClick={requestLocation}
            className="mt-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 md:mt-3 md:px-4 md:py-2.5"
          >
            Konumumu kullan
          </button>
        )}
      </section>

      <div className="-mx-4 md:mx-0">
        <MapExplorerClient
          eczaneler={eczaneler}
          scope={
            geoStatus === "granted"
              ? { type: "all", label: cityName }
              : fallbackScope
          }
          autoLocate={geoStatus === "granted"}
          highlightNearest={geoStatus === "granted"}
          className="map-explorer--page map-explorer--tall"
        />
      </div>

      <div className="pb-4 text-center">
        <Link
          href={`/${citySlug}`}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Tüm {cityName} nöbetçi eczanelerine dön
        </Link>
      </div>
    </div>
  );
}
