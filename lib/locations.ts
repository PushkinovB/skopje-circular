export const PAKOMAK_SOURCE_URL = "https://maps.pakomak.mk/arcgis/rest/services/PAKOMAK/garbage_containers_dashboard/MapServer/1";

export const MATERIALS = ["paper", "plastic", "glass", "metal", "organics"] as const;
export type Material = (typeof MATERIALS)[number];

export type RecyclingLocation = {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  acceptedMaterials: Material[];
  sourceName: string;
  sourceUrl: string;
  lastCheckedAt: string;
  verified: true;
};

export type LocationResponse = {
  locations: RecyclingLocation[];
  status: "current" | "stale" | "unavailable" | "empty";
  checkedAt: string | null;
  message?: string;
};

export function normalizeMaterial(value: string): Material | null {
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/paper|papir|hartij|karton|харти/.test(normalized)) return "paper";
  if (/plastic|plastika|plastmasa|pet|пласт|пет/.test(normalized)) return "plastic";
  if (/glass|staklo|stakl|стакл/.test(normalized)) return "glass";
  if (/metal|limenka|alumin|метал/.test(normalized)) return "metal";
  if (/organic|bio.?waste|organ|bio.?otpad|орган|био.?отпад/.test(normalized)) return "organics";
  return null;
}

export function isStale(date: string | null | undefined) {
  if (!date) return true;
  const timestamp = Date.parse(date);
  return !Number.isFinite(timestamp) || Date.now() - timestamp > 45 * 24 * 60 * 60 * 1000;
}

export function arcgisLocationQueryUrl(queryBase = `${PAKOMAK_SOURCE_URL}/query`) {
  const params = new URLSearchParams({
    where: "municipality_name LIKE '%Скопје%' OR municipality_name LIKE '%Skopje%'",
    outFields: "objectid,named_location,address,garbage_type,municipality_name",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
  });
  return `${queryBase}?${params.toString()}`;
}
