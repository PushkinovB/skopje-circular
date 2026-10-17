"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";

const CITY_WASTE_TONNES = 222_358;
const LANDFILL_FEE_MKD_PER_TONNE = 680;
const USD_PER_EUR = 1.1206;
const MKD_PER_EUR = 61.5;
const CAPEX_USD_PER_ANNUAL_TONNE = [600, 1_000] as const;
const NET_OPEX_USD_PER_TONNE = [25, 30] as const;
const DISCOUNT_RATE = 0.05;

const copy = {
  en: {
    title: "A transparent {years}-year screening model",
    intro: "Change the assumed share of Skopje’s reported waste that remains after prevention, reuse, recycling and organics treatment. This is a planning scenario, not a project budget or a promise of savings.",
    baseLabel: "Skopje reported waste · 2023",
    baseScope: "Municipal and other non-hazardous waste reported to the environment ministry. Reporting coverage and definitions are incomplete.",
    residualLabel: "Share assumed to remain as non-recyclable residual waste",
    residualHelp: "Planning assumption only. Replace it with a seasonal waste-composition audit before sizing a plant.",
    yearsLabel: "Investment period",
    years: "years",
    discountLabel: "Real discount rate used for present value",
    capacity: "Illustrative residual throughput",
    capital: "Plant capital benchmark",
    capitalHelp: "Upfront plant CAPEX range; does not include the city-wide collection, sorting or heat network.",
    opex: "Annual plant operating benchmark",
    opexHelp: "Net operating cost after typical European energy revenues; not a Skopje quote.",
    fee: "Avoided landfill tipping fee proxy",
    feeHelp: "680 MKD/t before VAT, cited in a neighboring municipality’s plan for waste sent to Drisla. Confirm Skopje’s actual contract rate.",
    delta: "{years}-year additional cost vs landfill-fee-only baseline",
    deltaHelp: "Plant CAPEX + discounted net plant operations − discounted avoided tipping fees. Positive means this benchmark case costs more than the direct landfill fee alone.",
    annualDelta: "Annualized comparison",
    plantOnly: "Plant-only screening estimate",
    methodTitle: "How the estimate is calculated",
    method: [
      "Throughput = 222,358 reported tonnes × the selected residual share.",
      "CAPEX = throughput × $600–$1,000 per annual tonne of capacity (World Bank European incineration benchmark).",
      "Net OPEX = throughput × $25–$30/tonne; the source says this European net gate-fee benchmark already reflects typical energy revenue and some subsidies.",
      "Avoided landfill fee = throughput × 680 MKD/tonne proxy. The 20-year comparison discounts annual net differences at 5% real.",
    ],
    limitsTitle: "What this number does not include",
    limits: "Separate collection vehicles and bins, recycling and organics plants, transfer stations, land, grid and district-heat connections, financing fees, VAT, permitting, emissions-control upgrades, ash and residue disposal, decommissioning, staffing outside the thermal plant, or local heat/power/material contracts. These can materially increase total cost. No household-bill savings, material revenue or CO₂ reduction is claimed.",
    noSavings: "The avoided landfill charge is not net project savings. Under this imported benchmark, plant operating and capital costs exceed the direct landfill-fee proxy; the model therefore shows an additional cost, before the excluded system costs.",
    fx: "Conversions: ECB 9 Oct 2026 reference rate ($1.1206 per €1); planning conversion €1 = MKD 61.5. Values are rounded, do not include inflation and are for screening only.",
    evidenceTitle: "Local evidence and benchmark sources",
    sources: [
      { label: "Environment Ministry · 2023 environmental report (Skopje waste table and reporting limits)", href: "https://portal.mdt.gov.mk/post-body-files/godisen-izvestaj-za-kvalitet-na-zivotna-sredina-file-T28L.pdf" },
      { label: "World Bank · What a Waste 2.0 (European WtE CAPEX and net OPEX benchmarks)", href: "https://documents1.worldbank.org/curated/en/697271544470229584/pdf/What-a-Waste-2-0-A-Global-Snapshot-of-Solid-Waste-Management-to-2050.pdf" },
      { label: "Drisla fee proxy · Zelenikovo municipal gazette (2025 work plan)", href: "https://zelenikovo.gov.mk/wp-content/uploads/2024/12/%D0%A1%D0%9B%D0%A3%D0%96%D0%91%D0%95%D0%9D-%D0%93%D0%9B%D0%90%D0%A1%D0%9D%D0%98%D0%9A-17-2024.pdf" },
      { label: "ECB · 9 Oct 2026 euro reference rates", href: "https://www.ecb.europa.eu/stats/exchange/eurofxref/shared/pdf/2026/10/20261009.pdf" },
    ],
  },
  mk: {
    title: "Транспарентен скрининг-модел за {years} години",
    intro: "Промени го претпоставениот удел од пријавениот отпад во Скопје што останува по спречување, повторна употреба, рециклирање и третман на органскиот отпад. Ова е сценарио за планирање, не буџет за проект и не ветување за заштеда.",
    baseLabel: "Пријавен отпад во Скопје · 2023",
    baseScope: "Комунален и друг неопасен отпад пријавен до Министерството за животна средина. Опфатот и дефинициите во известувањето се нецелосни.",
    residualLabel: "Претпоставен удел што останува како нерециклабилен остаток",
    residualHelp: "Само претпоставка за планирање. Пред одредување капацитет потребна е сезонска анализа на составот на отпадот.",
    yearsLabel: "Период на инвестиција",
    years: "години",
    discountLabel: "Реална дисконтна стапка за сегашна вредност",
    capacity: "Илустративен капацитет за остаток",
    capital: "Референтен капитален трошок на постројка",
    capitalHelp: "Опсег на почетен CAPEX за постројка; не ги вклучува градските возила, селекцијата или топлинската мрежа.",
    opex: "Годишен референтен оперативен трошок",
    opexHelp: "Нето оперативен трошок по типични европски приходи од енергија; не е понуда за Скопје.",
    fee: "Избегнат надомест за депонирање · прокси",
    feeHelp: "680 МКД/т пред ДДВ, наведени во план на соседна општина за отпад испратен во Дрисла. Потврдете ја реалната тарифа за Скопје.",
    delta: "Дополнителен трошок за {years} години наспроти само депонирање",
    deltaHelp: "CAPEX на постројка + намалени нето оперативни трошоци − намалени надоместоци за депонирање. Позитивна бројка значи дека ова референтно сценарио чини повеќе од директната такса за депонирање.",
    annualDelta: "Годишен еквивалент",
    plantOnly: "Скрининг-процена само за постројка",
    methodTitle: "Како се пресметува процената",
    method: [
      "Капацитет = 222.358 пријавени тони × избраниот удел на остаток.",
      "CAPEX = капацитет × 600–1.000 USD за годишен тон капацитет (Светска банка, европски референтен WtE).",
      "Нето OPEX = капацитет × 25–30 USD/тон; изворот вели дека европскиот нето надомест веќе ги вклучува типичните приходи од енергија и некои субвенции.",
      "Избегнат надомест за депонирање = капацитет × прокси 680 МКД/тон. Разликата за 20 години се дисконтира со 5% реално.",
    ],
    limitsTitle: "Што не е вклучено во оваа бројка",
    limits: "Возила и канти за одделно собирање, постројки за рециклирање и органски отпад, претоварни станици, земјиште, приклучоци на мрежа и централно греење, трошоци за финансирање, ДДВ, дозволи, надградба на контрола на емисии, пепел и остатоци, затворање, персонал надвор од термичката постројка и локални договори за топлина/струја/материјали. Овие ставки може значително да ја зголемат вкупната цена. Не се тврди заштеда на сметки, приход од материјали или намалување на CO₂.",
    noSavings: "Избегнатата такса за депонирање не е нето-заштеда од проектот. Според увезениот референтен опсег, оперативните и капиталните трошоци на постројката се повисоки од прокси-таксата за депонирање; моделот затоа прикажува дополнителен трошок, пред да се додадат исклучените системски ставки.",
    fx: "Конверзија: референтен курс на ЕЦБ од 9 октомври 2026 ($1,1206 за €1); планска конверзија €1 = 61,5 МКД. Бројките се заокружени, без инфлација и само за првичен скрининг.",
    evidenceTitle: "Локални податоци и референтни извори",
    sources: [
      { label: "Министерство за животна средина · извештај за 2023 (отпад во Скопје и ограничувања во известувањето)", href: "https://portal.mdt.gov.mk/post-body-files/godisen-izvestaj-za-kvalitet-na-zivotna-sredina-file-T28L.pdf" },
      { label: "Светска банка · What a Waste 2.0 (европски референтни трошоци за WtE)", href: "https://documents1.worldbank.org/curated/en/697271544470229584/pdf/What-a-Waste-2-0-A-Global-Snapshot-of-Solid-Waste-Management-to-2050.pdf" },
      { label: "Прокси за Дрисла · Службен гласник на Општина Зелениково (програма за работа 2025)", href: "https://zelenikovo.gov.mk/wp-content/uploads/2024/12/%D0%A1%D0%9B%D0%A3%D0%96%D0%91%D0%95%D0%9D-%D0%93%D0%9B%D0%90%D0%A1%D0%9D%D0%98%D0%9A-17-2024.pdf" },
      { label: "ЕЦБ · референтни курсеви од 9 октомври 2026", href: "https://www.ecb.europa.eu/stats/exchange/eurofxref/shared/pdf/2026/10/20261009.pdf" },
    ],
  },
} as const;

function compactMoney(value: number, currency: "MKD" | "EUR", language: "mk" | "en") {
  const locale = language === "mk" ? "mk-MK" : "en-GB";
  const divisor = value >= 1_000_000_000 ? 1_000_000_000 : value >= 1_000_000 ? 1_000_000 : 1_000;
  const suffix = value >= 1_000_000_000 ? (language === "mk" ? "млрд." : "bn") : value >= 1_000_000 ? (language === "mk" ? "млн." : "m") : (language === "mk" ? "илј." : "k");
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value / divisor);
  return `${currency} ${number} ${suffix}`;
}

function moneyRange(low: number, high: number, currency: "MKD" | "EUR", language: "mk" | "en") {
  return `${compactMoney(low, currency, language)} – ${compactMoney(high, currency, language)}`;
}

export function ImpactDashboard() {
  const { language } = useLanguage();
  const text = copy[language];
  const [residualShare, setResidualShare] = useState(35);
  const [years, setYears] = useState(20);
  const modelTitle = text.title.replace("{years}", String(years));
  const deltaLabel = text.delta.replace("{years}", String(years));

  const annualCapacity = CITY_WASTE_TONNES * (residualShare / 100);
  const usdToMkd = MKD_PER_EUR / USD_PER_EUR;
  const capitalLow = annualCapacity * CAPEX_USD_PER_ANNUAL_TONNE[0] * usdToMkd;
  const capitalHigh = annualCapacity * CAPEX_USD_PER_ANNUAL_TONNE[1] * usdToMkd;
  const opexLow = annualCapacity * NET_OPEX_USD_PER_TONNE[0] * usdToMkd;
  const opexHigh = annualCapacity * NET_OPEX_USD_PER_TONNE[1] * usdToMkd;
  const avoidedLandfillFee = annualCapacity * LANDFILL_FEE_MKD_PER_TONNE;
  const annuityFactor = (1 - Math.pow(1 + DISCOUNT_RATE, -years)) / DISCOUNT_RATE;
  const capitalRecoveryFactor = 1 / annuityFactor;
  const additionalNpvLow = capitalLow + (opexLow - avoidedLandfillFee) * annuityFactor;
  const additionalNpvHigh = capitalHigh + (opexHigh - avoidedLandfillFee) * annuityFactor;
  const annualizedDeltaLow = capitalLow * capitalRecoveryFactor + opexLow - avoidedLandfillFee;
  const annualizedDeltaHigh = capitalHigh * capitalRecoveryFactor + opexHigh - avoidedLandfillFee;
  const formatTonnes = (amount: number) => new Intl.NumberFormat(language === "mk" ? "mk-MK" : "en-GB", { maximumFractionDigits: 0 }).format(amount);

  return (
    <section className="impact-dashboard" aria-labelledby="dashboard-title">
      <header className="dashboard-heading"><div><span className="eyebrow">{language === "mk" ? "СКОПЈЕ · СЦЕНАРИО ЗА РЕФЕРЕНТНА ПРОЦЕНА" : "SKOPJE · SCREENING SCENARIO"}</span><h2 id="dashboard-title">{modelTitle}</h2><p>{text.intro}</p></div><span className="scenario-badge">{text.plantOnly}</span></header>

      <div className="dashboard-layout">
        <div className="scenario-controls">
          <div className="baseline-card"><span className="eyebrow">{text.baseLabel}</span><strong>{formatTonnes(CITY_WASTE_TONNES)} {language === "mk" ? "тони" : "tonnes"}</strong><p>{text.baseScope}</p></div>
          <label className="range-control" htmlFor="residual-share"><span><b>{text.residualLabel}</b><output htmlFor="residual-share">{residualShare}%</output></span><input id="residual-share" type="range" min="10" max="70" step="5" value={residualShare} onChange={(event) => setResidualShare(Number(event.target.value))} aria-describedby="residual-share-help"/><small id="residual-share-help">{text.residualHelp}</small></label>
          <label className="select-control" htmlFor="investment-years"><b>{text.yearsLabel}</b><select id="investment-years" value={years} onChange={(event) => setYears(Number(event.target.value))}><option value={15}>15 {text.years}</option><option value={20}>20 {text.years}</option><option value={25}>25 {text.years}</option></select></label>
          <p className="discount-note">{text.discountLabel}: <b>5%</b></p>
          <div className="capacity-callout"><span>{text.capacity}</span><strong>{formatTonnes(annualCapacity)} {language === "mk" ? "тони/год." : "tonnes/year"}</strong></div>
        </div>

        <div className="dashboard-results" aria-live="polite" aria-atomic="true">
          <article className="result-card result-capital"><span className="result-label">{text.capital}</span><strong>{moneyRange(capitalLow, capitalHigh, "MKD", language)}</strong><small>{moneyRange(capitalLow / MKD_PER_EUR, capitalHigh / MKD_PER_EUR, "EUR", language)}</small><p>{text.capitalHelp}</p></article>
          <article className="result-card result-opex"><span className="result-label">{text.opex}</span><strong>{moneyRange(opexLow, opexHigh, "MKD", language)}</strong><small>{language === "mk" ? "годишно" : "per year"}</small><p>{text.opexHelp}</p></article>
          <article className="result-card result-avoided"><span className="result-label">{text.fee}</span><strong>{compactMoney(avoidedLandfillFee, "MKD", language)}</strong><small>{language === "mk" ? "годишно" : "per year"}</small><p>{text.feeHelp}</p></article>
          <article className="result-card result-delta"><span className="result-label">{deltaLabel}</span><strong>{moneyRange(additionalNpvLow, additionalNpvHigh, "MKD", language)}</strong><small>{moneyRange(additionalNpvLow / MKD_PER_EUR, additionalNpvHigh / MKD_PER_EUR, "EUR", language)}</small><p>{text.deltaHelp}</p><div className="annualized-delta"><span>{text.annualDelta}</span><b>{moneyRange(annualizedDeltaLow, annualizedDeltaHigh, "MKD", language)}</b></div></article>
        </div>
      </div>

      <p className="no-savings-callout"><strong>{language === "mk" ? "Важно:" : "Read this first:"}</strong> {text.noSavings}</p>

      <div className="calculation-notes">
        <article><h3>{text.methodTitle}</h3><ol>{text.method.map((line) => <li key={line}>{line}</li>)}</ol></article>
        <article className="calculation-limits"><h3>{text.limitsTitle}</h3><p>{text.limits}</p><small>{text.fx}</small></article>
      </div>
    </section>
  );
}

export const impactSources = {
  en: copy.en.sources,
  mk: copy.mk.sources,
};
