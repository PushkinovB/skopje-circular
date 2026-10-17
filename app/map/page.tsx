"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";
import { MATERIALS, type LocationResponse, type Material, type RecyclingLocation } from "@/lib/locations";

const RecyclingMap = dynamic(() => import("@/components/recycling-map"), { ssr: false, loading: () => <div className="map-skeleton" aria-label="Loading map" /> });

export default function MapPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<LocationResponse | null>(null);
  const [material, setMaterial] = useState<Material | "all">("all");
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

  const locations = useMemo(() => (data?.locations ?? []).filter((location) => material === "all" || location.acceptedMaterials.includes(material)), [data, material]);
  const materialLabel: Record<Material, string> = { paper: t("paper"), plastic: t("plastic"), glass: t("glass"), metal: t("metal"), organics: t("organics") };

  return <div className="page-shell">
    <section className="page-intro map-intro"><span className="eyebrow">{t("mapEyebrow")}</span><div className="intro-flex"><div><h1>{t("mapTitle")}</h1><p>{t("mapIntro")}</p></div><div className="status-pill"><span className={`status-dot ${data?.status === "current" ? "is-current" : ""}`} />{loading ? t("checkingLocations") : data?.status === "current" ? t("verified") : data?.status === "stale" ? t("stale") : data?.status === "empty" ? t("noLocations") : t("unavailable")}</div></div>
      <div className="filter-row"><label htmlFor="material-filter">{t("material")}</label><select id="material-filter" value={material} onChange={(event) => setMaterial(event.target.value as Material | "all")}><option value="all">{t("allMaterials")}</option>{MATERIALS.map((value) => <option key={value} value={value}>{materialLabel[value]}</option>)}</select><span className="filter-count">{loading ? "…" : locations.length} {language === "mk" ? "места" : "locations"}</span></div>
    </section>
    <section className="map-layout" aria-label={t("mapTitle")}>
      <div className="map-box"><RecyclingMap locations={locations} language={language} /></div>
      <div className="location-list" aria-live="polite">
        {loading ? <div className="empty-state"><span className="spinner" /><p>{language === "mk" ? "Се вчитуваат проверените места…" : "Loading verified locations…"}</p></div> : locations.length ? locations.map((location) => <LocationCard key={location.id} location={location} language={language} materialLabel={materialLabel} />) : <div className="empty-state"><span className="empty-icon">⌖</span><h2>{data?.status === "unavailable" ? t("unavailable") : material === "all" ? t("noLocations") : t("noFilteredLocations")}</h2><p>{language === "mk" ? "Провери ја изворната мапа додека се внесуваат или освежуваат податоците." : "Check the source map while verified records are being added or refreshed."}</p><a className="text-link" href="https://maps.pakomak.mk/" target="_blank" rel="noreferrer">{t("mapSourceFallback")} ↗</a></div>}
      </div>
    </section>
    <div className="source-note"><span>i</span><p>{language === "mk" ? "Прикажуваме само потврдени места и познати материјали. Информациите може да се променат; проверете го изворот пред патување." : "Only verified points and known materials are shown. Information can change; check the source before travelling."}</p><a href="https://maps.pakomak.mk/" target="_blank" rel="noreferrer">{language === "mk" ? "Изворна мапа ↗" : "Source map ↗"}</a></div>
    <div className="cta-inline"><p>{t("joinBody")}</p><Link href="/join" className="button button-dark">{t("navJoin")} <span aria-hidden="true">↗</span></Link></div>
  </div>;
}

function LocationCard({ location, language, materialLabel }: { location: RecyclingLocation; language: "mk" | "en"; materialLabel: Record<Material, string> }) {
  const { t } = useLanguage();
  const checked = location.lastCheckedAt ? new Intl.DateTimeFormat(language === "mk" ? "mk-MK" : "en-GB", { dateStyle: "medium" }).format(new Date(location.lastCheckedAt)) : "—";
  const stale = !location.lastCheckedAt || Date.now() - Date.parse(location.lastCheckedAt) > 45 * 86400000;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
  return <article className="location-card"><div className="location-card-top"><span className="location-type">⌖ {language === "mk" ? "Пункт за рециклирање" : "Recycling point"}</span><span className={`freshness ${stale ? "freshness-stale" : ""}`}>● {stale ? t("stale") : t("verified")}</span></div><h2>{location.name}</h2>{location.address && <p className="location-address">{location.address}</p>}<p className="location-materials-label">{t("accepted")}</p><div className="material-tags">{location.acceptedMaterials.map((item) => <span key={item}>{materialLabel[item]}</span>)}</div><div className="location-meta"><span>{t("source")}: <a href={location.sourceUrl} target="_blank" rel="noreferrer">{location.sourceName} ↗</a></span><span>{t("checked")}: {checked}</span></div><a className="direction-link" href={directions} target="_blank" rel="noreferrer">{language === "mk" ? "Насоки на мапа" : "Get directions"} ↗</a></article>;
}
