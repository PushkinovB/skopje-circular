"use client";

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
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

export default function RecyclingMap({ bins, language, selectedBinId, onBinSelect }: {
  bins: RecyclingBin[];
  language: Language;
  selectedBinId: string | null;
  onBinSelect?: (binId: string) => void;
}) {
  return (
    <div role="region" aria-label={language === "mk" ? "Мапа на канти во Скопје" : "Map of bins in Skopje"}>
      <MapContainer center={[41.9981, 21.4254]} zoom={12} scrollWheelZoom={false} className="leaflet-map">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url={tileUrl} />
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
              {language === "mk" ? "Канта" : "Bin"}
            </Popup>
          </Marker>
        ))}
        <MapExtent bins={bins} selectedBinId={selectedBinId} />
      </MapContainer>
    </div>
  );
}

function MapExtent({ bins, selectedBinId }: { bins: RecyclingBin[]; selectedBinId: string | null }) {
  const map = useMap();
  useEffect(() => {
    const selected = bins.find((bin) => bin.id === selectedBinId) ?? bins[0];

    if (!selected) return;
    if (selectedBinId) {
      map.setView([selected.latitude, selected.longitude], 14);
      return;
    }

    if (bins.length > 1) {
      map.fitBounds(L.latLngBounds(bins.map(({ latitude, longitude }) => L.latLng(latitude, longitude))), { padding: [34, 34], maxZoom: 14 });
      return;
    }

    map.setView([selected.latitude, selected.longitude], 14);
  }, [bins, map, selectedBinId]);

  return null;
}
