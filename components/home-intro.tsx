"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export function HomeIntro() {
  const { t } = useLanguage();
  return (
    <section className="hero-wrap">
      <div className="hero-copy">
        <div className="hero-overline"><span className="live-dot" /> {t("cityOnly")}</div>
        <div className="future-label">{t("futureDemo")}</div>
        <h1>{t("heroTitle")}</h1>
        <p className="hero-description">{t("heroBody")}</p>
        <div className="hero-actions">
          <Link className="button button-dark" href="/map">{t("exploreMap")} <span aria-hidden="true">↗</span></Link>
          <Link className="button button-light" href="/map">{t("cityOnly") === "SKOPJE ONLY · NORTH MACEDONIA" ? "Find nearest bin" : "Најблиска канта"} <span aria-hidden="true">⌖</span></Link>
          <Link className="button button-light" href="/workflow">{t("seeFlow")}</Link>
        </div>
        <div className="hero-proof"><span className="proof-check">✓</span><span>{t("notLive")}</span></div>
      </div>
      <div className="hero-art" aria-label="Illustration of a circular city system">
        <div className="art-sun" />
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
        <div className="art-city"><div className="city-building building-one"><i /><i /><i /><i /></div><div className="city-building building-two"><i /><i /><i /><i /><i /><i /></div><div className="city-building building-three"><i /><i /><i /><i /></div><div className="city-house"><i /></div></div>
        <div className="art-bin"><span>♻</span></div>
        <div className="art-leaf leaf-one">✳</div><div className="art-leaf leaf-two">✳</div>
        <div className="art-badge badge-left"><b>↻</b><span>Materials<br />stay useful</span></div>
        <div className="art-badge badge-right"><b>♨</b><span>Heat for<br />the city</span></div>
        <div className="art-caption">SKOPJE · NORTH MACEDONIA <span>42°00′N 21°26′E</span></div>
      </div>
    </section>
  );
}
