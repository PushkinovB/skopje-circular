"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export function HomePath() {
  const { t } = useLanguage();
  return <>
    <section className="section home-path-section">
      <div className="section-heading-row"><div><span className="eyebrow">01 — 03</span><h2>{t("pathTitle")}</h2><p className="muted">{t("pathIntro")}</p></div><Link className="text-link" href="/workflow">{t("seeFlow")} <span aria-hidden="true">↗</span></Link></div>
      <div className="path-cards">
        <article className="path-card path-card-map"><span className="card-number">01</span><div className="card-icon" aria-hidden="true">⌖</div><h3>{t("pathMapTitle")}</h3><p>{t("pathMapBody")}</p><Link href="/map">{t("pathMapLink")} <span aria-hidden="true">↗</span></Link></article>
        <article className="path-card path-card-pilot"><span className="card-number">02</span><div className="card-icon" aria-hidden="true">↗</div><h3>{t("pathJoinTitle")}</h3><p>{t("pathJoinBody")}</p><Link href="/join">{t("pathJoinLink")} <span aria-hidden="true">↗</span></Link></article>
        <article className="path-card path-card-heat"><span className="card-number">03</span><div className="card-icon" aria-hidden="true">♨</div><h3>{t("pathEconomicsTitle")}</h3><p>{t("pathEconomicsBody")}</p><Link href="/economics">{t("pathEconomicsLink")} <span aria-hidden="true">↗</span></Link></article>
      </div>
    </section>
    <section className="quote-band"><span aria-hidden="true">“</span><p>{t("quoteText")}</p><small>{t("quoteCaption")}</small></section>
  </>;
}
