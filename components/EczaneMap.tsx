"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { getDirectionsUrl } from "@/lib/geo";
import type { Coordinates } from "@/lib/geo";
import {
  createEczaneClusterIcon,
  getPharmacyIcon,
  userIcon,
} from "@/lib/map-icons";
import type { EczaneWithDistance } from "@/lib/types";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";

export interface EczaneMapHandle {
  flyToUser: () => void;
  flyToEczane: (lat: number, lng: number) => void;
  fitAll: () => void;
}

function EczanePopupContent({ eczane }: { eczane: EczaneWithDistance }) {
  const primaryPhone = eczane.phones[0]?.replace(/\s+/g, "") ?? "";

  return (
    <div className="eczane-popup">
      <h3 className="eczane-popup-title">{eczane.name}</h3>
      <p className="eczane-popup-meta">
        {eczane.district}
        {typeof eczane.distanceMeters === "number" && (
          <>
            {" · "}
            {eczane.distanceMeters < 1000
              ? `${Math.round(eczane.distanceMeters)} m`
              : `${(eczane.distanceMeters / 1000).toFixed(1)} km`}
          </>
        )}
      </p>
      <p className="eczane-popup-address">{eczane.address}</p>
      {eczane.phones[0] && (
        <p className="eczane-popup-phone">{eczane.phones[0]}</p>
      )}
      <div className="eczane-popup-actions">
        <a
          href={getDirectionsUrl(eczane.lat, eczane.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="eczane-popup-btn eczane-popup-btn--primary"
        >
          Yol Tarifi
        </a>
        {primaryPhone && (
          <a href={`tel:${primaryPhone}`} className="eczane-popup-btn">
            Ara
          </a>
        )}
      </div>
    </div>
  );
}

function MapController({
  eczaneler,
  userLocation,
  selectedId,
  focusUserTrigger,
  markerRefs,
  onReady,
}: {
  eczaneler: EczaneWithDistance[];
  userLocation?: Coordinates | null;
  selectedId?: string | null;
  focusUserTrigger: number;
  markerRefs: MutableRefObject<Map<string, L.Marker>>;
  onReady: (map: L.Map) => void;
}) {
  const map = useMap();
  const initialFitDone = useRef(false);

  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  useEffect(() => {
    if (initialFitDone.current) return;
    const points: [number, number][] = eczaneler.map((e) => [e.lat, e.lng]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points).pad(0.15));
    initialFitDone.current = true;
  }, [eczaneler, map, userLocation]);

  useEffect(() => {
    if (!selectedId) return;
    const eczane = eczaneler.find((e) => e.id === selectedId);
    if (!eczane) return;
    map.flyTo([eczane.lat, eczane.lng], 16, { duration: 0.55 });
    const marker = markerRefs.current.get(selectedId);
    if (!marker) return;
    const openPopup = () => marker.openPopup();
    map.once("moveend", openPopup);
    const timer = window.setTimeout(openPopup, 650);
    return () => {
      map.off("moveend", openPopup);
      window.clearTimeout(timer);
    };
  }, [eczaneler, map, markerRefs, selectedId]);

  useEffect(() => {
    if (!focusUserTrigger || !userLocation) return;
    map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 0.55 });
  }, [focusUserTrigger, map, userLocation]);

  return null;
}

interface EczaneMapProps {
  eczaneler: EczaneWithDistance[];
  userLocation?: Coordinates | null;
  locationAccuracy?: number | null;
  selectedId?: string | null;
  onSelect?: (eczane: EczaneWithDistance) => void;
  className?: string;
  focusUserTrigger?: number;
}

export const EczaneMap = forwardRef<EczaneMapHandle, EczaneMapProps>(
  function EczaneMap(
    {
      eczaneler,
      userLocation,
      locationAccuracy,
      selectedId,
      onSelect,
      className = "h-full w-full",
      focusUserTrigger = 0,
    },
    ref,
  ) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRefs = useRef<Map<string, L.Marker>>(new Map());

    const center = useMemo<[number, number]>(() => {
      if (userLocation) return [userLocation.lat, userLocation.lng];
      if (eczaneler[0]) return [eczaneler[0].lat, eczaneler[0].lng];
      return [40.1885, 29.061];
    }, [eczaneler, userLocation]);

    useImperativeHandle(ref, () => ({
      flyToUser() {
        if (!mapRef.current || !userLocation) return;
        mapRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
          duration: 0.55,
        });
      },
      flyToEczane(lat: number, lng: number) {
        if (!mapRef.current) return;
        mapRef.current.flyTo([lat, lng], 16, { duration: 0.55 });
      },
      fitAll() {
        if (!mapRef.current || eczaneler.length === 0) return;
        const points: [number, number][] = eczaneler.map((e) => [e.lat, e.lng]);
        if (userLocation) points.push([userLocation.lat, userLocation.lng]);
        mapRef.current.fitBounds(L.latLngBounds(points).pad(0.15));
      },
    }));

    return (
      <div className={className}>
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          <MapController
            eczaneler={eczaneler}
            userLocation={userLocation}
            selectedId={selectedId}
            focusUserTrigger={focusUserTrigger}
            markerRefs={markerRefs}
            onReady={(map) => {
              mapRef.current = map;
            }}
          />
          {userLocation && (
            <>
              {locationAccuracy && locationAccuracy > 0 && (
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={locationAccuracy}
                  pathOptions={{
                    color: "#2563eb",
                    fillColor: "#2563eb",
                    fillOpacity: 0.12,
                    weight: 1,
                  }}
                />
              )}
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={userIcon}
                title="Konumunuz"
              />
            </>
          )}
          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            spiderfyOnMaxZoom
            maxClusterRadius={50}
            disableClusteringAtZoom={16}
            iconCreateFunction={createEczaneClusterIcon}
          >
            {eczaneler.map((eczane) => (
              <Marker
                key={eczane.id}
                ref={(marker) => {
                  if (marker) {
                    markerRefs.current.set(eczane.id, marker);
                  } else {
                    markerRefs.current.delete(eczane.id);
                  }
                }}
                position={[eczane.lat, eczane.lng]}
                icon={getPharmacyIcon(selectedId === eczane.id)}
                title={eczane.name}
                eventHandlers={{
                  click: () => onSelect?.(eczane),
                }}
              >
                <Popup
                  className="eczane-leaflet-popup"
                  minWidth={240}
                  maxWidth={280}
                >
                  <EczanePopupContent eczane={eczane} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    );
  },
);
