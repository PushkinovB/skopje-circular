"use client";

import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { Language } from "@/lib/i18n";
import type { RecyclingBin } from "@/lib/bins";

const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const pointIcon = (selected = false) =>
  L.divIcon({
    className: "map-marker-wrap",
    html: `<span class="map-marker ${selected ? "map-marker-selected" : ""}">${selected ? "•" : "◉"}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const userIcon = L.divIcon({
  className: "map-marker-wrap",
  html: '<span class="map-marker map-marker-user">●</span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

export default function RecyclingMap({
  bins,
  language,
  selectedBinId,
  onBinSelect,
  routeTarget,
  userLocation,
}: {
  bins: RecyclingBin[];
  language: Language;
  selectedBinId: string | null;
  onBinSelect?: (binId: string) => void;
  routeTarget?: RecyclingBin | null;
  userLocation?: [number, number] | null;
}) {
  return (
    <div role="region" aria-label={language === "mk" ? "Мапа на канти во Скопје" : "Map of bins in Skopje"}>
      <MapContainer center={[41.9981, 21.4254]} zoom={12} scrollWheelZoom={false} className="leaflet-map">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url={tileUrl} />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>{language === "mk" ? "Вашата локација" : "Your location"}</Popup>
          </Marker>
        )}

        {routeTarget && userLocation && (
          <Polyline positions={[userLocation, [routeTarget.latitude, routeTarget.longitude]]} pathOptions={{ color: "#2f7d66", weight: 4, opacity: 0.9, dashArray: "8 8" }} />
        )}

        {bins.map((bin) => (
          <Marker
            key={bin.id}
            position={[bin.latitude, bin.longitude]}
            icon={pointIcon(selectedBinId === bin.id)}
            eventHandlers={{ click: () => onBinSelect?.(bin.id) }}
          >
            <Popup>
              <strong>{bin.road}</strong><br />
              {bin.address}<br />
              {language === "mk" ? "Канта" : "Bin"} · {bin.fill === "empty" ? (language === "mk" ? "Празна" : "Empty") : (language === "mk" ? "Средно полна" : "Half full")}
            </Popup>
          </Marker>
        ))}
        <MapExtent bins={bins} selectedBinId={selectedBinId} routeTarget={routeTarget} userLocation={userLocation ?? null} />
      </MapContainer>
    </div>
  );
}

function MapExtent({ bins, selectedBinId, routeTarget, userLocation }: { bins: RecyclingBin[]; selectedBinId: string | null; routeTarget?: RecyclingBin | null; userLocation?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    const markers = [] as [number, number][];
    if (userLocation) markers.push(userLocation);
    if (routeTarget) markers.push([routeTarget.latitude, routeTarget.longitude]);

    if (selectedBinId) {
      const selected = bins.find((bin) => bin.id === selectedBinId);
      if (selected) markers.push([selected.latitude, selected.longitude]);
    }

    if (markers.length >= 2) {
      map.fitBounds(L.latLngBounds(markers.map(([latitude, longitude]) => L.latLng(latitude, longitude))), { padding: [48, 48], maxZoom: 15 });
      return;
    }

    const selected = bins.find((bin) => bin.id === selectedBinId) ?? bins[0];
    if (!selected) return;
    if (bins.length > 1) {
      map.fitBounds(L.latLngBounds(bins.map(({ latitude, longitude }) => L.latLng(latitude, longitude))), { padding: [34, 34], maxZoom: 14 });
      return;
    }
    map.setView([selected.latitude, selected.longitude], 14);
  }, [bins, map, routeTarget, selectedBinId, userLocation]);

  return null;
}
