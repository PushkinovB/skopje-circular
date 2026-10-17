"use client";

import { useLanguage } from "@/components/language-provider";

const world = [
  { title: "copenhagen", body: "copenhagenBody", href: "https://a-r-c.dk/amager-bakke/", tag: "ARC · residual waste" },
  { title: "stockholm", body: "stockholmBody", href: "https://www.stockholmexergi.se/om-stockholm-exergi/vara-anlaggningar/hogdalenverket/", tag: "Stockholm Exergi" },
  { title: "vienna", body: "viennaBody", href: "https://www.wienenergie.at/ueber-uns/unternehmen/energie-klimaschutz/energieerzeugung/abfallverwertungsanlagen/", tag: "Wien Energie" },
  { title: "seoul", body: "seoulBody", href: "https://english.seoul.go.kr/operation-koreas-largest-sewage-heat-based-heating-supply-facility/", tag: "Sewage heat pumps" },
] as const;

export default function EconomicsPage() {
  const { t, language } = useLanguage();
  const values = ["valueMaterials", "valueContracts", "valueHeat", "valueJobs"] as const;
  const costs = ["costCollection", "costSorting", "costTreatment", "costNetwork"] as const;
  return <div className="page-shell economics-shell">
    <section className="page-intro economics-intro"><span className="eyebrow">{t("economicsEyebrow")}</span><h1>{t("economicsTitle")}</h1><p>{t("economicsIntro")}</p><div className="no-roi"><span aria-hidden="true">↗</span><div><b>{language === "mk" ? "Без измислен ROI за Скопје" : "No invented Skopje ROI"}</b><small>{language === "mk" ? "Прво ни требаат локални количини и цени." : "Local waste volumes and prices come first."}</small></div></div></section>
    <section className="economics-columns"><article className="economics-column value-column"><div className="column-heading"><span>+</span><h2>{t("potentialValue")}</h2></div><ul>{values.map((key) => <li key={key}><span>↗</span>{t(key)}</li>)}</ul></article><article className="economics-column cost-column"><div className="column-heading"><span>−</span><h2>{t("realCosts")}</h2></div><ul>{costs.map((key) => <li key={key}><span>↘</span>{t(key)}</li>)}</ul></article></section>
    <section className="world-section"><div className="section-heading-row"><div><span className="eyebrow">{language === "mk" ? "МЕЃУНАРОДНИ ПРИМЕРИ" : "INTERNATIONAL EXAMPLES"}</span><h2>{t("worldLessons")}</h2></div><p>{language === "mk" ? "Примери се насоки за учење, не готови модели за копирање." : "Examples are lessons to study, not ready-made models to copy."}</p></div><div className="world-grid">{world.map((item, index) => <article className="world-card" key={item.title}><span className={`world-number world-number-${index}`}>0{index + 1}</span><span className="world-tag">{item.tag}</span><h3>{t(item.title)}</h3><p>{t(item.body)}</p><a href={item.href} target="_blank" rel="noreferrer">{t("learnMore")}</a></article>)}</div></section>
    <section className="lessons-band"><div className="lessons-icon">!</div><div><span className="eyebrow">{t("bottlenecks")}</span><p>{t("bottleneckBody")}</p><p>{t("northMacedonia")}</p></div></section>
    <section className="research-sources"><h2>{t("sources")}</h2><div className="source-links">
      <a href="https://www.eea.europa.eu/en/europe-environment-2025/countries/north-macedonia/waste-generation" target="_blank" rel="noreferrer">EEA · North Macedonia waste baseline ↗</a>
      <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52025SC0753" target="_blank" rel="noreferrer">European Commission · 2025 report ↗</a>
      <a href="https://www.oecd.org/en/publications/waste-management-and-the-circular-economy-in-selected-oecd-countries_9789264309395-en/full-report/component-6.html" target="_blank" rel="noreferrer">OECD · waste management review ↗</a>
      <a href="https://northmacedonia.un.org/sites/default/files/2026-05/UNMK%20ARR%202025_final_0.pdf" target="_blank" rel="noreferrer">UN North Macedonia · district-heating context ↗</a>
    </div></section>
  </div>;
}
