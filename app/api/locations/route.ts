import { NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase";
import { arcgisLocationQueryUrl, isStale, normalizeMaterial, PAKOMAK_SOURCE_URL, type LocationResponse, type Material, type RecyclingLocation } from "@/lib/locations";

export const dynamic = "force-dynamic";

type LocationRow = {
  id: string; name: string; address: string | null; latitude: number; longitude: number;
  accepted_materials: string[]; source_name: string; source_url: string; last_checked_at: string;
  is_verified: boolean;
};

export async function GET() {
  const supabase = getPublicSupabase();
  if (supabase) {
    const { data, error } = await supabase.from("collection_locations").select("id,name,address,latitude,longitude,accepted_materials,source_name,source_url,last_checked_at,is_verified").eq("municipality", "Skopje").eq("is_verified", true).order("name");
    if (!error) {
      const rows = (data ?? []) as LocationRow[];
      const locations = rows.flatMap((row): RecyclingLocation[] => {
        const acceptedMaterials = row.accepted_materials.map(normalizeMaterial).filter((item): item is Material => item !== null);
        if (!acceptedMaterials.length || !Number.isFinite(row.latitude) || !Number.isFinite(row.longitude)) return [];
        return [{ id: row.id, name: row.name, address: row.address, latitude: row.latitude, longitude: row.longitude, acceptedMaterials, sourceName: row.source_name, sourceUrl: row.source_url, lastCheckedAt: row.last_checked_at, verified: true }];
      });
      if (rows.length > 0 || process.env.PAKOMAK_CONNECTOR_ENABLED !== "true") {
        const checkedAt = rows.reduce<string | null>((latest, row) => !latest || Date.parse(row.last_checked_at) > Date.parse(latest) ? row.last_checked_at : latest, null);
        const status = locations.length === 0 ? "empty" : isStale(checkedAt) ? "stale" : "current";
        return NextResponse.json({ locations, status, checkedAt } satisfies LocationResponse, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
      }
    }
  }

  if (process.env.PAKOMAK_CONNECTOR_ENABLED === "true") {
    try {
      const queryBase = process.env.PAKOMAK_ARCGIS_QUERY_URL ?? `${PAKOMAK_SOURCE_URL}/query`;
      const response = await fetch(arcgisLocationQueryUrl(queryBase), { signal: AbortSignal.timeout(8000), cache: "no-store" });
      if (!response.ok) throw new Error(`Pakomak query returned ${response.status}`);
      const geojson = await response.json() as { features?: Array<{ id?: string | number; properties?: Record<string, unknown>; geometry?: { type?: string; coordinates?: number[] } }> };
      const locations = (geojson.features ?? []).flatMap((feature): RecyclingLocation[] => {
        const properties = feature.properties ?? {};
        const place = String(properties.municipality_name ?? "").toLocaleLowerCase();
        const materials = String(properties.garbage_type ?? "").split(/[,;/|]+/).map(normalizeMaterial).filter((item): item is Material => item !== null);
        const coords = feature.geometry?.coordinates;
        if (!place.includes("скоп") && !place.includes("skop") || !coords || coords.length < 2 || materials.length === 0) return [];
        const [longitude, latitude] = coords;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < 41.8 || latitude > 42.2 || longitude < 21.2 || longitude > 21.7) return [];
        return [{ id: String(feature.id ?? properties.objectid ?? `${latitude},${longitude}`), name: String(properties.named_location ?? properties.address ?? "Recycling point"), address: properties.address ? String(properties.address) : null, latitude, longitude, acceptedMaterials: [...new Set(materials)], sourceName: "Pakomak", sourceUrl: PAKOMAK_SOURCE_URL, lastCheckedAt: new Date().toISOString(), verified: true }];
      });
      return NextResponse.json({ locations, status: locations.length ? "current" : "empty", checkedAt: new Date().toISOString() } satisfies LocationResponse, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
    } catch (error) {
      console.error("Pakomak location connector unavailable", error);
    }
  }

  return NextResponse.json({ locations: [], status: "unavailable", checkedAt: null, message: "No verified location source is configured." } satisfies LocationResponse, { status: 503, headers: { "Cache-Control": "no-store" } });
}
