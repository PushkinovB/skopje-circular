"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { type LocationResponse, type Material, type RecyclingLocation } from "@/lib/locations";

const RecyclingMap = dynamic(() => import("@/components/recycling-map"), { ssr: false, loading: () => <div className="map-skeleton" aria-label="Loading map" /> });

export default function MapPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<LocationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/locations", { signal: controller.signal, cache: "no-store" })
      .then((response) => response.json() as Promise<LocationResponse>)
      .then(setData)
      .catch(() => setData({ locations: [], status: "unavailable", checkedAt: null }))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const locations = useMemo(() => groupLocationsBySite(data?.locations ?? []), [data]);
  const materialLabel: Record<Material, string> = { paper: t("paper"), plastic: t("plastic"), glass: t("glass"), metal: t("metal"), organics: t("organics") };

  return <div className="page-shell">
    <section className="page-intro map-intro"><span className="eyebrow">{t("mapEyebrow")}</span><div className="intro-flex"><div><h1>{t("mapTitle")}</h1><p>{t("mapIntro")}</p></div><div className="status-pill"><span className={`status-dot ${data?.status === "current" ? "is-current" : ""}`} />{loading ? t("checkingLocations") : data?.status === "current" ? t("verified") : data?.status === "stale" ? t("stale") : data?.status === "empty" ? t("noLocations") : t("unavailable")}</div></div>
      <div className="location-summary" aria-live="polite"><strong>{loading ? "…" : locations.length}</strong><span>{language === "mk" ? "места" : "verified sites"}</span><small>{t("onePointPerSite")}</small></div>
    </section>
    <div className="source-note mixed-bin-note" role="note"><span aria-hidden="true">↻</span><p><strong>{t("mixedBinTitle")}</strong> {t("mixedBinBody")}</p></div>
    <section className="map-layout" aria-label={t("mapTitle")}>
      <div className="map-box"><RecyclingMap locations={locations} language={language} /></div>
      <div className="location-list" aria-live="polite">
        {loading ? <div className="empty-state"><span className="spinner" /><p>{language === "mk" ? "Се вчитуваат проверените места…" : "Loading verified locations…"}</p></div> : locations.length ? locations.map((location) => <LocationCard key={location.id} location={location} language={language} materialLabel={materialLabel} />) : <div className="empty-state"><span className="empty-icon">⌖</span><h2>{data?.status === "unavailable" ? t("unavailable") : t("noLocations")}</h2><p>{language === "mk" ? "Провери ја изворната мапа додека се внесуваат или освежуваат податоците." : "Check the source map while verified records are being added or refreshed."}</p><a className="text-link" href="https://maps.pakomak.mk/" target="_blank" rel="noreferrer">{t("mapSourceFallback")} ↗</a></div>}
      </div>
    </section>
    <div className="source-note"><span>i</span><p>{language === "mk" ? "Прикажуваме само потврдени места и познати материјали. Информациите може да се променат; проверете го изворот пред патување." : "Only verified points and known materials are shown. Information can change; check the source before travelling."}</p><a href="https://maps.pakomak.mk/" target="_blank" rel="noreferrer">{language === "mk" ? "Изворна мапа ↗" : "Source map ↗"}</a></div>
    <div className="cta-inline"><p>{t("joinBody")}</p><Link href="/join" className="button button-dark">{t("navJoin")} <span aria-hidden="true">↗</span></Link></div>
  </div>;
}

function normalizeSitePart(value: string | null) {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

function groupLocationsBySite(locations: RecyclingLocation[]): RecyclingLocation[] {
  const sites = new Map<string, RecyclingLocation>();
  for (const location of locations) {
    const key = [normalizeSitePart(location.name), normalizeSitePart(location.address), location.latitude.toFixed(4), location.longitude.toFixed(4)].join("|");
    const existing = sites.get(key);
    if (!existing) {
      sites.set(key, { ...location, acceptedMaterials: [...new Set(location.acceptedMaterials)] });
      continue;
    }
    const currentChecked = Date.parse(existing.lastCheckedAt);
    const nextChecked = Date.parse(location.lastCheckedAt);
    sites.set(key, {
      ...existing,
      acceptedMaterials: [...new Set([...existing.acceptedMaterials, ...location.acceptedMaterials])],
      lastCheckedAt: nextChecked < currentChecked ? location.lastCheckedAt : existing.lastCheckedAt,
    });
  }
  return [...sites.values()];
}

function LocationCard({ location, language, materialLabel }: { location: RecyclingLocation; language: "mk" | "en"; materialLabel: Record<Material, string> }) {
  const { t } = useLanguage();
  const checked = location.lastCheckedAt ? new Intl.DateTimeFormat(language === "mk" ? "mk-MK" : "en-GB", { dateStyle: "medium" }).format(new Date(location.lastCheckedAt)) : "—";
  const stale = !location.lastCheckedAt || Date.now() - Date.parse(location.lastCheckedAt) > 45 * 86400000;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
  return <article className="location-card"><div className="location-card-top"><span className="location-type">⌖ {language === "mk" ? "Пункт за рециклирање" : "Recycling point"}</span><span className={`freshness ${stale ? "freshness-stale" : ""}`}>● {stale ? t("stale") : t("verified")}</span></div><h2>{location.name}</h2>{location.address && <p className="location-address">{location.address}</p>}<p className="location-materials-label">{t("accepted")}</p><div className="material-tags">{location.acceptedMaterials.map((item) => <span key={item}>{materialLabel[item]}</span>)}</div><div className="location-meta"><span>{t("source")}: <a href={location.sourceUrl} target="_blank" rel="noreferrer">{location.sourceName} ↗</a></span><span>{t("checked")}: {checked}</span></div><a className="direction-link" href={directions} target="_blank" rel="noreferrer">{language === "mk" ? "Насоки на мапа" : "Get directions"} ↗</a></article>;
}
