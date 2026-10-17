"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { getDistanceKm, normalizeBins, type FillLevel, type RecyclingBin } from "@/lib/bins";

const RecyclingMap = dynamic(() => import("@/components/recycling-map"), {
  ssr: false,
  loading: () => <div className="map-skeleton" aria-label="Loading map" />,
});

const FILL_COLORS: Record<FillLevel, string> = { empty: "#728b60", half: "#e9b95f", full: "#b95d3d" };
const DEFAULT_CENTER: [number, number] = [41.9981, 21.4254];

export default function MapPage() {
  const { language } = useLanguage();
  const [bins, setBins] = useState<RecyclingBin[]>([]);
  const [customBins, setCustomBins] = useState<RecyclingBin[]>([]);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [road, setRoad] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [routeBinId, setRouteBinId] = useState<string | null>(null);
  const [routeRequestId, setRouteRequestId] = useState(0);
  const [routeStatus, setRouteStatus] = useState<"loading" | "ready" | "error" | null>(null);

  useEffect(() => {
    void fetch("/bins.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Bin data could not be loaded");
        return response.json() as Promise<unknown>;
      })
      .then((value) => {
        const normalized = normalizeBins(value);
        setBins(normalized);
      })
      .catch(() => {
        setUnavailable(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("skopje-custom-bins");
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        setCustomBins(normalizeBins(parsed));
      }
    } catch {
      setCustomBins([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && customBins.length) {
      window.localStorage.setItem("skopje-custom-bins", JSON.stringify(customBins));
    }
  }, [customBins]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setUserLocation(DEFAULT_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
      () => setUserLocation(DEFAULT_CENTER),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const allBins = useMemo(() => [...bins, ...customBins], [bins, customBins]);

  const recommendedBins = useMemo(() => {
    return [...allBins]
      .filter((bin) => bin.fill === "empty" || bin.fill === "half")
      .sort((a, b) => {
        const aDistance = getDistanceKm(userLocation ?? DEFAULT_CENTER, [a.latitude, a.longitude]);
        const bDistance = getDistanceKm(userLocation ?? DEFAULT_CENTER, [b.latitude, b.longitude]);
        return aDistance - bDistance;
      });
  }, [allBins, userLocation]);

  useEffect(() => {
    if (recommendedBins.length > 0 && !selectedBinId) {
      setSelectedBinId(recommendedBins[0].id);
    }
  }, [selectedBinId, recommendedBins]);

  const selectedBin = useMemo(() => {
    const target = selectedBinId ? allBins.find((bin) => bin.id === selectedBinId) : recommendedBins[0];
    return target ?? recommendedBins[0] ?? null;
  }, [allBins, recommendedBins, selectedBinId]);

  const routeBin = useMemo(() => {
    if (!routeBinId) return selectedBin;
    return allBins.find((bin) => bin.id === routeBinId) ?? selectedBin;
  }, [allBins, routeBinId, selectedBin]);

  function showRouteForBin(binId: string) {
    setSelectedBinId(binId);
    setRouteBinId(binId);
    setRouteRequestId((current) => current + 1);
  }

  function addBin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const latitudeValue = Number(latitude);
    const longitudeValue = Number(longitude);
    if (!road.trim() || !Number.isFinite(latitudeValue) || !Number.isFinite(longitudeValue)) return;

    const nextBin: RecyclingBin = {
      id: `custom-${Date.now()}`,
      type: "general",
      road: road.trim(),
      address: address.trim() || "New Skopje bin",
      latitude: latitudeValue,
      longitude: longitudeValue,
      fill: "half",
      updatedAt: new Date().toISOString(),
    };

    setCustomBins((current) => [nextBin, ...current]);
    setSelectedBinId(nextBin.id);
    setRouteBinId(nextBin.id);
    setFormOpen(false);
    setRoad("");
    setAddress("");
    setLatitude("");
    setLongitude("");
  }

  return (
    <div className="page-shell">
      <section className="page-intro map-intro">
        <span className="eyebrow">{language === "mk" ? "Места за отпад" : "Waste locations"}</span>
        <div className="intro-flex">
          <div>
            <h1>{language === "mk" ? "Канти во Скопје" : "Bins in Skopje"}</h1>
            <p>{language === "mk"
              ? "Најблиската празна или полна канта се прикажува прво, заедно со растојание, време до пристигнување и маршрут до неа."
              : "The nearest empty or half-full bin is shown first, along with distance, travel time and the route to reach it."}</p>
          </div>
          <div className="status-pill">
            <span className={`status-dot ${!loading && !unavailable ? "is-current" : ""}`} />
            {loading ? (language === "mk" ? "Се вчитува…" : "Loading…") : unavailable ? (language === "mk" ? "Податоците не се достапни" : "Data unavailable") : `${recommendedBins.length} ${language === "mk" ? "достапни канти" : "available bins"}`}
          </div>
        </div>
      </section>

      {userLocation && (
        <div className="route-summary" aria-live="polite">
          <div>
            <span className="summary-label">{language === "mk" ? "Вашата локација" : "Your location"}</span>
            <strong>{formatCoordinates(userLocation, language)}</strong>
          </div>
          {routeBin && (
            <div>
              <span className="summary-label">{language === "mk" ? "Најблиска доступна канта" : "Nearest available bin"}</span>
              <strong>{routeBin.road}</strong>
            </div>
          )}
          {routeBin && userLocation && (
            <div>
              <span className="summary-label">{language === "mk" ? "Растојание и време" : "Distance and time"}</span>
              <strong>{formatDistance(routeBin, userLocation, language)} · {formatWalkingTime(routeBin, userLocation, language)}</strong>
            </div>
          )}
        </div>
      )}

      <div className="bin-action-row">
        <button type="button" className="button button-dark" onClick={() => setFormOpen((current) => !current)}>
          {formOpen ? (language === "mk" ? "Откажи" : "Cancel") : (language === "mk" ? "Додади нова канта" : "Add new bin")}
        </button>
        {routeBin && (
          <button type="button" className="button button-light" disabled={routeStatus === "loading"} onClick={() => showRouteForBin(routeBin.id)}>
            {language === "mk"
              ? routeStatus === "loading" ? "Се бара маршрут…" : routeStatus === "ready" ? "Маршрут прикажан" : routeStatus === "error" ? "Маршрутот не е достапен · обиди повторно" : "Покажи маршрут"
              : routeStatus === "loading" ? "Finding street route…" : routeStatus === "ready" ? "Route shown" : routeStatus === "error" ? "Route unavailable · retry" : "Show route"}
          </button>
        )}
      </div>

      {formOpen && (
        <form className="add-bin-form" onSubmit={addBin}>
          <label>
            {language === "mk" ? "Локација / улица" : "Location / street"}
            <input value={road} onChange={(event) => setRoad(event.target.value)} required />
          </label>
          <label>
            {language === "mk" ? "Адреса" : "Address"}
            <input value={address} onChange={(event) => setAddress(event.target.value)} />
          </label>
          <div className="add-bin-grid">
            <label>
              {language === "mk" ? "Географска ширина" : "Latitude"}
              <input value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder={String(DEFAULT_CENTER[0])} required />
            </label>
            <label>
              {language === "mk" ? "Географска должина" : "Longitude"}
              <input value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder={String(DEFAULT_CENTER[1])} required />
            </label>
          </div>
          <div className="add-bin-actions">
            <button type="button" className="button button-light" onClick={() => {
              if (userLocation) {
                setLatitude(String(userLocation[0]));
                setLongitude(String(userLocation[1]));
              }
            }}>{language === "mk" ? "Користи моја локација" : "Use my location"}</button>
            <button type="submit" className="button button-dark">{language === "mk" ? "Зачувај канта" : "Save bin"}</button>
          </div>
        </form>
      )}

      <section className="map-layout" aria-label={language === "mk" ? "Мапа на канти" : "Bin map"}>
        <div className="map-box">
          <RecyclingMap
            bins={recommendedBins.length ? recommendedBins : allBins}
            language={language}
            selectedBinId={selectedBinId}
            onBinSelect={setSelectedBinId}
            routeTarget={routeBinId ? routeBin : null}
            userLocation={userLocation ?? DEFAULT_CENTER}
            onRouteStatus={setRouteStatus}
            routeRequestId={routeRequestId}
          />
        </div>

        <div className="location-list" aria-live="polite">
          {loading ? (
            <div className="empty-state">
              <span className="spinner" />
              <p>{language === "mk" ? "Се вчитуваат кантите…" : "Loading bins…"}</p>
            </div>
          ) : unavailable ? (
            <div className="empty-state">
              <span className="empty-icon">⌖</span>
              <h2>{language === "mk" ? "Нема достапни канти" : "No bins available"}</h2>
              <p>{language === "mk" ? "Провери дали /bins.json е правилно поставен." : "Check that /bins.json is available and correctly formatted."}</p>
            </div>
          ) : recommendedBins.length ? (
            recommendedBins.map((bin, index) => (
              <BinCard
                key={bin.id}
                bin={bin}
                index={index}
                isClosest={index === 0}
                language={language}
                distance={userLocation ?? DEFAULT_CENTER}
                onRoute={() => showRouteForBin(bin.id)}
                onShow={() => {
                  setSelectedBinId(bin.id);
                }}
              />
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">⌖</span>
              <h2>{language === "mk" ? "Нема канти" : "No bins"}</h2>
              <p>{language === "mk" ? "Додај локации во public/bins.json или користи функцијата за нова канта." : "Add a location to public/bins.json or use the add-bin tool."}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BinCard({ bin, index, isClosest, language, distance, onRoute, onShow }: {
  bin: RecyclingBin;
  index: number;
  isClosest: boolean;
  language: "mk" | "en";
  distance: [number, number];
  onRoute: () => void;
  onShow: () => void;
}) {
  const travelTime = formatWalkingTime(bin, distance, language);
  const dist = formatDistance(bin, distance, language);

  return (
    <article className="location-card bin-card" role="listitem">
      <div className="location-card-top">
        <span className="location-type">{language === "mk" ? "Канта" : "Bin"}</span>
        <span className="freshness" style={{ color: FILL_COLORS[bin.fill] }}>
          {language === "mk" ? (bin.fill === "full" ? "Полн" : bin.fill === "half" ? "Средно" : "Празен") : (bin.fill === "full" ? "Full" : bin.fill === "half" ? "Moderate" : "Empty")}
        </span>
      </div>
      <h2>{bin.road}</h2>
      <p className="location-address">{bin.address}</p>
      <div className="location-materials-label">{isClosest ? (language === "mk" ? "Најблиска" : "Closest") : `#${index + 1}`}</div>
      <div className="material-tags">
        <span>{bin.fill === "empty" ? (language === "mk" ? "Празна" : "Empty") : language === "mk" ? "Половина" : "Half full"}</span>
      </div>
      <div className="route-meta">
        <span>{dist}</span>
        <span>{travelTime}</span>
      </div>
      <div className="bin-card-actions">
        <button type="button" className="direction-link" onClick={onShow}>{language === "mk" ? "Покажи на мапата" : "Show on map"} ↗</button>
        <button type="button" className="button button-light route-button" onClick={onRoute}>{language === "mk" ? "Маршрут" : "Route"}</button>
      </div>
    </article>
  );
}

function formatDistance(bin: RecyclingBin, reference: [number, number], language: "mk" | "en") {
  const distanceKm = getDistanceKm(reference, [bin.latitude, bin.longitude]);
  const text = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`;
  return `${text} ${language === "mk" ? "од вас" : "from you"}`;
}

function formatWalkingTime(bin: RecyclingBin, reference: [number, number], language: "mk" | "en") {
  const distanceKm = getDistanceKm(reference, [bin.latitude, bin.longitude]);
  const minutes = Math.max(2, Math.round((distanceKm / 4.5) * 60));
  return `${minutes} ${language === "mk" ? "мин" : "min"}`;
}

function formatCoordinates(coordinates: [number, number], language: "mk" | "en") {
  return `${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}${language === "mk" ? " · Скопје" : " · Skopje"}`;
}
