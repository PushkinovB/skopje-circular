export const BIN_TYPES = ["general"] as const;
export type BinType = (typeof BIN_TYPES)[number];
export type FillLevel = "empty" | "half" | "full";

export type RecyclingBin = {
  id: string;
  type: BinType;
  road: string;
  address: string;
  latitude: number;
  longitude: number;
  fill: FillLevel;
  updatedAt: string;
  sourceUrl?: string;
};

export function normalizeBins(value: unknown): RecyclingBin[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry as Record<string, unknown>;
    const id = typeof candidate.id === "string" ? candidate.id : "bin";
    const road = typeof candidate.road === "string" ? candidate.road : "Skopje bin";
    const address = typeof candidate.address === "string" ? candidate.address : "Skopje";
    const latitude = typeof candidate.latitude === "number" ? candidate.latitude : Number(candidate.latitude);
    const longitude = typeof candidate.longitude === "number" ? candidate.longitude : Number(candidate.longitude);
    const fill = typeof candidate.fill === "string" && ["empty", "half", "full"].includes(candidate.fill) ? (candidate.fill as FillLevel) : "half";
    const updatedAt = typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString();
    const sourceUrl = typeof candidate.sourceUrl === "string" ? candidate.sourceUrl : undefined;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];

    return [{
      id,
      type: "general",
      road,
      address,
      latitude,
      longitude,
      fill,
      updatedAt,
      sourceUrl,
    }];
  });
}

export function getDistanceKm(from: [number, number], to: [number, number]) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to[0] - from[0]);
  const dLng = toRadians(to[1] - from[1]);
  const lat1 = toRadians(from[0]);
  const lat2 = toRadians(to[0]);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function loadLocalBinReports() {
  if (typeof window === "undefined") return {} as Record<string, Partial<Pick<RecyclingBin, "fill" | "updatedAt">>>;

  try {
    const raw = window.localStorage.getItem("skopje-bin-reports");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalBinReport(id: string, values: Partial<Pick<RecyclingBin, "fill" | "updatedAt">>) {
  if (typeof window === "undefined") return;

  const reports = loadLocalBinReports();
  window.localStorage.setItem("skopje-bin-reports", JSON.stringify({ ...reports, [id]: { ...reports[id], ...values } }));
}
