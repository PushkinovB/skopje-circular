"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { BIN_TYPES, loadLocalBinReports, normalizeBins, saveLocalBinReport, type BinType, type FillLevel, type RecyclingBin } from "@/lib/bins";

const RecyclingMap = dynamic(() => import("@/components/recycling-map"), {
  ssr: false,
  loading: () => <div className="map-skeleton" aria-label="Loading map" />,
});

const TYPE_COLORS: Record<BinType, string> = { paper: "#4f78a8", plastic: "#b6952e", glass: "#4e7868" };
const FILL_COLORS: Record<FillLevel, string> = { empty: "#728b60", half: "#e9b95f", full: "#b95d3d" };

export default function MapPage() {
  const { t, language } = useLanguage();
  const [bins, setBins] = useState<RecyclingBin[]>([]);
  const [material, setMaterial] = useState<BinType | "all">("all");
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [road, setRoad] = useState("");
  const [newBinType, setNewBinType] = useState<BinType>("paper");
  const [placementMode, setPlacementMode] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/bins.json", { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Bin data could not be loaded");
        return response.json() as Promise<unknown>;
      })
      .then(async (value) => {
        let communityData: unknown = null;
        try {
          const communityResponse = await fetch("/api/bins", { signal: controller.signal, cache: "no-store" });
          if (communityResponse.ok) communityData = await communityResponse.json();
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") throw error;
        }
        const reports = loadLocalBinReports();
        const combined = new Map<string, RecyclingBin>();
        for (const bin of [...normalizeBins(value), ...normalizeBins(communityData)]) combined.set(bin.id, bin);
        setBins([...combined.values()].map((bin) => reports[bin.id] ? { ...bin, ...reports[bin.id] } : bin));
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setUnavailable(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const visibleBins = useMemo(
    () => bins.filter((bin) => material === "all" || bin.type === material),
    [bins, material],
  );
  const typeLabel: Record<BinType, string> = {
    paper: t("paper"), plastic: t("plastic"), glass: t("glass"),
  };
  const fillLabel: Record<FillLevel, string> = {
    empty: t("binEmpty"), half: t("binHalf"), full: t("binFull"),
  };

  function reportFill(id: string, fill: FillLevel) {
    const updatedAt = new Date().toISOString();
    setBins((current) => current.map((bin) => bin.id === id ? { ...bin, fill, updatedAt } : bin));
    saveLocalBinReport(id, { fill, updatedAt });
  }

  async function submitBin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!position) {
      setFormMessage(t("binNeedLocation"));
      return;
    }
    setSubmitting(true);
    setFormMessage("");
    try {
      const response = await fetch("/api/bin-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ road, type: newBinType, latitude: position[0], longitude: position[1], website: "" }),
      });
      if (!response.ok) throw new Error("The submission could not be saved");
      setFormMessage(t("binSubmitSuccess"));
      setRoad("");
      setPosition(null);
      setPlacementMode(false);
    } catch {
      setFormMessage(t("binSubmitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="page-shell">
    <section className="page-intro map-intro">
      <span className="eyebrow">{t("mapEyebrow")}</span>
      <div className="intro-flex">
        <div><h1>{t("mapTitle")}</h1><p>{t("mapIntro")}</p></div>
        <div className="status-pill"><span className={`status-dot ${!loading && !unavailable ? "is-current" : ""}`} />
          {loading ? t("binsLoading") : unavailable ? t("binsUnavailable") : formatBinCount(bins.length, language)}
        </div>
      </div>
      <div className="filter-row">
        <label htmlFor="material-filter">{t("binType")}</label>
        <select id="material-filter" value={material} onChange={(event) => setMaterial(event.target.value as BinType | "all")}>
          <option value="all">{t("allMaterials")}</option>
          {BIN_TYPES.map((value) => <option key={value} value={value}>{typeLabel[value]}</option>)}
        </select>
        <span className="filter-count">{loading ? "…" : formatBinCount(visibleBins.length, language)}</span>
      </div>
    </section>

    <div className="source-note mixed-bin-note" role="note"><span aria-hidden="true">↻</span><p><strong>{t("mixedBinTitle")}</strong> {t("mixedBinBody")}</p></div>

    <section className="bin-suggestion-area">
      <div className="bin-suggestion-toggle">
        <div><strong>{t("binAddButton")}</strong><p>{t("binAddIntro")}</p></div>
        <button type="button" className="button button-light" aria-expanded={suggestionOpen} onClick={() => { setSuggestionOpen((open) => !open); setFormMessage(""); }}>
          {suggestionOpen ? t("binCancel") : t("binAddButton")} <span aria-hidden="true">{suggestionOpen ? "−" : "+"}</span>
        </button>
      </div>
      {suggestionOpen && <form className="bin-suggestion-form" onSubmit={submitBin}>
        <label>{t("binAddress")}<input value={road} onChange={(event) => setRoad(event.target.value)} maxLength={160} minLength={2} required /></label>
        <label>{t("binType")}<select value={newBinType} onChange={(event) => setNewBinType(event.target.value as BinType)}>
          {BIN_TYPES.map((type) => <option key={type} value={type}>{typeLabel[type]}</option>)}
        </select></label>
        <div className="bin-position-picker">
          <button type="button" className="button button-light" aria-pressed={placementMode} onClick={() => { setPlacementMode((active) => !active); setFormMessage(""); }}>
            {placementMode ? t("binStopPicking") : position ? t("binChangePin") : t("binChooseLocation")}
          </button>
          <p role="status">{position ? `${t("binCoordinates")}: ${position[0].toFixed(5)}, ${position[1].toFixed(5)}` : t("binPickInstructions")}</p>
        </div>
        <label className="bin-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
        {formMessage && <p className="bin-form-message" role="status">{formMessage}</p>}
        <div className="bin-form-actions">
          <button type="submit" className="button button-dark" disabled={submitting || !position}>{submitting ? t("binSubmitting") : t("binSubmit")}</button>
          <span>{t("binModerationNote")}</span>
        </div>
      </form>}
    </section>

    <section className="map-layout" aria-label={t("mapTitle")}>
      <div className="map-box"><RecyclingMap bins={visibleBins} language={language} onReport={reportFill} selectedBinId={selectedBinId} placementMode={placementMode} selectedPosition={position} onPositionSelect={(nextPosition) => {
        const [latitude, longitude] = nextPosition;
        if (latitude < 41.8 || latitude > 42.2 || longitude < 21.2 || longitude > 21.7) {
          setPosition(null);
          setPlacementMode(false);
          setFormMessage(t("binOutsideArea"));
          return;
        }
        setPosition(nextPosition);
        setPlacementMode(false);
        setFormMessage("");
      }} /></div>
      <div className="location-list" aria-live="polite">
        {loading ? <div className="empty-state"><span className="spinner" /><p>{t("binsLoading")}</p></div>
          : unavailable ? <div className="empty-state"><span className="empty-icon">⌖</span><h2>{t("binsUnavailable")}</h2><p>{language === "mk" ? "Провери дали public/bins.json е поставена и правилно форматирана." : "Check that public/bins.json is present and formatted correctly."}</p></div>
            : visibleBins.length ? visibleBins.map((bin) => <BinCard key={bin.id} bin={bin} language={language} typeLabel={typeLabel} fillLabel={fillLabel} onShow={() => setSelectedBinId(bin.id)} />)
              : <div className="empty-state"><span className="empty-icon">⌖</span><h2>{material === "all" ? t("binsNone") : t("binsFilteredNone")}</h2><p>{language === "mk" ? "Додај ги кантите во public/bins.json за да се појават на мапата." : "Add bin records to public/bins.json to show them on the map."}</p></div>}
      </div>
    </section>

    <div className="source-note"><span>i</span><p>{t("binDataNote")}</p><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">{t("mapProviderNote")}</a></div>
    <div className="cta-inline"><p>{t("joinBody")}</p><Link href="/join" className="button button-dark">{t("navJoin")} <span aria-hidden="true">↗</span></Link></div>
  </div>;
}

function BinCard({ bin, language, typeLabel, fillLabel, onShow }: {
  bin: RecyclingBin;
  language: "mk" | "en";
  typeLabel: Record<BinType, string>;
  fillLabel: Record<FillLevel, string>;
  onShow: () => void;
}) {
  const { t } = useLanguage();
  const updated = Date.parse(bin.updatedAt);
  const checked = Number.isFinite(updated)
    ? new Intl.DateTimeFormat(language === "mk" ? "mk-MK" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(updated)
    : "—";
  const relative = Number.isFinite(updated) ? formatTimeAgo(updated, language) : null;

  return <article className="location-card bin-card">
    <div className="location-card-top"><span className="location-type"><i className="bin-type-dot" style={{ background: TYPE_COLORS[bin.type] }} />{typeLabel[bin.type]}{bin.stationId && <small className="bin-station-id">· {bin.stationId}</small>}</span>
      <span className="freshness" style={{ color: FILL_COLORS[bin.fill] }}>● {fillLabel[bin.fill]}</span></div>
    <h2>{bin.road}</h2>
    <p className="bin-updated">{t("binUpdated")}: {relative ?? checked}{relative ? ` · ${checked}` : ""}</p>
    <div className="bin-card-bottom"><span className="bin-fill-label"><i style={{ background: FILL_COLORS[bin.fill] }} />{fillLabel[bin.fill]}</span>
      <button type="button" className="bin-map-link" onClick={onShow}>{t("binShowOnMap")} ↗</button></div>
  </article>;
}

function formatTimeAgo(timestamp: number, language: "mk" | "en") {
  const mins = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (mins < 1) return language === "mk" ? "токму сега" : "just now";
  if (mins < 60) return language === "mk" ? `пред ${mins} мин.` : `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return language === "mk" ? `пред ${hours} ч.` : `${hours} h ago`;
  const days = Math.round(hours / 24);
  return language === "mk" ? `пред ${days} д.` : `${days} d ago`;
}

function formatBinCount(count: number, language: "mk" | "en") {
  if (language === "mk") return `${count} ${count === 1 ? "канта" : "канти"}`;
  return `${count} ${count === 1 ? "bin" : "bins"}`;
}
