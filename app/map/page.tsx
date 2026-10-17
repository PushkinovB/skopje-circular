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
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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

  const visibleBins = useMemo(() => {
    return [...bins].sort((a, b) => {
      const aDistance = userLocation ? getDistanceKm(userLocation, [a.latitude, a.longitude]) : 0;
      const bDistance = userLocation ? getDistanceKm(userLocation, [b.latitude, b.longitude]) : 0;
      return aDistance - bDistance;
    });
  }, [bins, userLocation]);

  useEffect(() => {
    if (visibleBins.length > 0 && !selectedBinId) {
      setSelectedBinId(visibleBins[0].id);
    }
  }, [selectedBinId, visibleBins]);

  const closestBin = visibleBins[0] ?? null;

  return (
    <div className="page-shell">
      <section className="page-intro map-intro">
        <span className="eyebrow">{language === "mk" ? "Места за отпад" : "Waste locations"}</span>
        <div className="intro-flex">
          <div>
            <h1>{language === "mk" ? "Канти во Скопје" : "Bins in Skopje"}</h1>
            <p>{language === "mk"
              ? "Најблиската канта се прикажува прво, а потоа сите канти во најпрометните делови на градот."
              : "The closest bin is shown first, followed by all bins in the busiest areas of the city."}</p>
          </div>
          <div className="status-pill">
            <span className={`status-dot ${!loading && !unavailable ? "is-current" : ""}`} />
            {loading ? (language === "mk" ? "Се вчитува…" : "Loading…") : unavailable ? (language === "mk" ? "Податоците не се достапни" : "Data unavailable") : `${visibleBins.length} ${language === "mk" ? "канти" : "bins"}`}
          </div>
        </div>
      </section>

      {closestBin && (
        <div className="location-summary" aria-live="polite">
          <strong>{language === "mk" ? "Најблиска канта" : "Closest bin"}:</strong>
          <span>{closestBin.road}</span>
          <small>{formatDistance(closestBin, userLocation ?? DEFAULT_CENTER, language)}</small>
        </div>
      )}

      <section className="map-layout" aria-label={language === "mk" ? "Мапа на канти" : "Bin map"}>
        <div className="map-box">
          <RecyclingMap bins={visibleBins} language={language} selectedBinId={selectedBinId} onBinSelect={setSelectedBinId} />
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
          ) : visibleBins.length ? (
            visibleBins.map((bin, index) => (
              <BinCard key={bin.id} bin={bin} index={index} isClosest={index === 0} language={language} onShow={() => setSelectedBinId(bin.id)} />
            ))
          ) : (
            <div className="empty-state">
              <span className="empty-icon">⌖</span>
              <h2>{language === "mk" ? "Нема канти" : "No bins"}</h2>
              <p>{language === "mk" ? "Додај локации во public/bins.json." : "Add locations to public/bins.json."}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BinCard({ bin, index, isClosest, language, onShow }: {
  bin: RecyclingBin;
  index: number;
  isClosest: boolean;
  language: "mk" | "en";
  onShow: () => void;
}) {
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
        <span>{language === "mk" ? "Општ отпад" : "General waste"}</span>
      </div>
      <div className="location-meta">
        <span>{language === "mk" ? "Последна проверка" : "Last checked"}: {new Date(bin.updatedAt).toLocaleDateString(language === "mk" ? "mk-MK" : "en-GB")}</span>
        <span>{language === "mk" ? "Растојание" : "Distance"}: {formatDistance(bin, DEFAULT_CENTER, language)}</span>
      </div>
      <button type="button" className="direction-link" onClick={onShow}>{language === "mk" ? "Покажи на мапата" : "Show on map"} ↗</button>
    </article>
  );
}

function formatDistance(bin: RecyclingBin, reference: [number, number], language: "mk" | "en") {
  const distanceKm = getDistanceKm(reference, [bin.latitude, bin.longitude]);
  const text = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`;
  return `${text} ${language === "mk" ? "од вас" : "from you"}`;
}
