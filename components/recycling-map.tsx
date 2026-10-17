"use client";

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { Language } from "@/lib/i18n";
import type { RecyclingLocation } from "@/lib/locations";

const pointIcon = L.divIcon({ className: "map-marker-wrap", html: '<span class="map-marker">♻</span>', iconSize: [34, 34], iconAnchor: [17, 17] });
const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function RecyclingMap({ locations, language }: { locations: RecyclingLocation[]; language: Language }) {
  return <div role="region" aria-label={language === "mk" ? "Мапа на места за рециклирање во Скопје" : "Map of recycling points in Skopje"}><MapContainer center={[41.9981, 21.4254]} zoom={12} scrollWheelZoom={false} className="leaflet-map">
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url={tileUrl} />
    {locations.map((location) => <Marker key={location.id} position={[location.latitude, location.longitude]} icon={pointIcon}><Popup><strong>{location.name}</strong><br />{location.address ?? "Skopje"}<br /><a href={location.sourceUrl} target="_blank" rel="noreferrer">{language === "mk" ? "Проверен извор ↗" : "Verified source ↗"}</a></Popup></Marker>)}
    <MapExtent locations={locations} />
  </MapContainer></div>;
}

function MapExtent({ locations }: { locations: RecyclingLocation[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 1) map.fitBounds(L.latLngBounds(locations.map(({ latitude, longitude }) => L.latLng(latitude, longitude))), { padding: [34, 34], maxZoom: 14 });
    else if (locations.length === 1) map.setView([locations[0].latitude, locations[0].longitude], 14);
  }, [locations, map]);
  return null;
}
