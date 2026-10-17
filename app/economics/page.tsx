"use client";

import { ImpactDashboard, impactSources } from "@/components/impact-dashboard";
import { useLanguage } from "@/components/language-provider";

const cityExamples = [
  { title: "copenhagen", body: "copenhagenBody", href: "https://a-r-c.dk/amager-bakke/", tag: "ARC · residual waste" },
  { title: "stockholm", body: "stockholmBody", href: "https://www.stockholmexergi.se/om-stockholm-exergi/vara-anlaggningar/hogdalenverket/", tag: "Stockholm Exergi" },
  { title: "vienna", body: "viennaBody", href: "https://www.wienenergie.at/ueber-uns/unternehmen/energie-klimaschutz/energieerzeugung/abfallverwertungsanlagen/", tag: "Wien Energie" },
  { title: "seoul", body: "seoulBody", href: "https://english.seoul.go.kr/operation-koreas-largest-sewage-heat-based-heating-supply-facility/", tag: "Sewage heat pumps" },
] as const;

const pageCopy = {
  en: {
    eyebrow: "SKOPJE · ECONOMY, ENVIRONMENT AND PEOPLE",
    title: "What could the city gain — and what would it cost?",
    intro: "A long-term screening model uses reported Skopje waste data and public international cost benchmarks. Its intended scope is the whole City of Skopje across all municipalities. It separates a fee avoided from real net savings and shows where local evidence is still missing.",
    benefitsEyebrow: "POTENTIAL BENEFITS · TO BE MEASURED",
    benefitsTitle: "Value for the city has more than one measure",
    benefits: [
      { title: "Local economic value", icon: "MKD", points: ["Recover paper, metals, glass and accepted plastics for local or regional manufacturers when quality and buyer contracts are secured.", "Potential income from producer-responsibility collection contracts, material sales and metered heat or electricity; none is booked in the model as Skopje revenue.", "Build skilled local work in collection, sorting, equipment maintenance, environmental monitoring and energy operations."] },
      { title: "Environmental outcomes", icon: "↻", points: ["Prevent waste first, then reuse and recycle; treat organics separately where a safe local outlet exists.", "A smaller residual stream could reduce landfill tonnage. Usable heat or power can displace other energy only if a verified customer uses it.", "Track stack emissions, bottom ash, air-pollution-control residues, rejects and lifecycle greenhouse gases. No zero-emission or CO₂-saving claim is made."] },
      { title: "Benefits for residents", icon: "⌂", points: ["Clear accepted-material guidance and accessible collection points can make sorting easier for children, older residents and people with disabilities.", "Cleaner public spaces and safer, traceable handling can support neighborhood health and dignity.", "Consult residents on facility siting, truck routes, noise, odors, affordability, worker safety and how results will be published."] },
    ],
    localEyebrow: "WHAT EXISTS IN SKOPJE TODAY",
    localTitle: "Useful starting points, not proof of spare capacity",
    localFacts: [
      { value: ">130,000 t/yr", title: "Waste sent to Drisla", body: "Skopje’s Public Enterprise Communal Hygiene says more than 130,000 tonnes of municipal waste are transported to Drisla annually. This is an operating-context figure, not the dashboard’s broader 2023 baseline." },
      { value: "~66,000", title: "Active district-heat consumers", body: "ESM reported about 65,000 households and more than 1,000 business users connected to its Skopje systems for the 2025/26 heating season. That does not establish spare heat demand, network capacity or an offtake agreement." },
    ],
    readinessEyebrow: "WHAT THE CONCEPT STILL NEEDS",
    readinessTitle: "Resolve these bottlenecks before choosing plant size",
    readiness: [
      { title: "Reliable waste data", body: "Weigh and sample household, business and seasonal waste; verify moisture, material composition, heating value, contamination and illegal dumping separately." },
      { title: "Collection that residents can trust", body: "Add convenient containers, clear instructions, separate truck compartments, dependable schedules, repair budgets and a human/manual fallback for failures." },
      { title: "Contracts before equipment", body: "Secure buyers for recyclables, a safe organics outlet, thermal residual specifications, heat/power offtake and responsibility for rejected loads and ash." },
      { title: "Right-sized treatment", body: "Do not size thermal capacity around today’s mixed waste. Oversizing can compete with prevention and recycling and can lock the city into feedstock contracts." },
      { title: "Heat-network fit", body: "Map monthly demand, temperatures, return-water conditions, pipe routes, grid connections and capital cost. Heat pumps for sewage or industrial heat need separate source and performance studies." },
      { title: "Permits and public safeguards", body: "Complete site, environmental and social assessment, consultation, emissions and residue plans, continuous monitoring, emergency response and public reporting." },
      { title: "Finance and operations", body: "Compare public procurement, grants, producer-responsibility funding and PPP options. Include whole-life costs, affordability, maintenance, staffing, insurance and decommissioning." },
    ],
    worldEyebrow: "INTERNATIONAL LESSONS",
    worldTitle: "Borrow lessons, not plant sizes",
    worldNote: "These cities have different waste composition, energy prices, regulations and heat networks. Their results are not Skopje forecasts.",
    sourceHeading: "Sources and model notes",
    extraSources: [
      { label: "ESM · Skopje district-heating customers, 2025/26", href: "https://www.esm.com.mk/?p=18124" },
      { label: "Communal Hygiene Skopje · current collection and Drisla context", href: "https://www.khigiena.com.mk/page/?id=7" },
      { label: "EU Waste Framework Directive · waste hierarchy", href: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=LEGISSUM%3Awaste_hierarchy" },
      { label: "EBRD · Belgrade Vinča integrated waste PPP", href: "https://www.ebrd.com/home/work-with-us/projects/psd/46758.html" },
      { label: "OECD · waste management and circular-economy lessons", href: "https://www.oecd.org/en/publications/waste-management-and-the-circular-economy-in-selected-oecd-countries_9789264309395-en/full-report/component-6.html" },
      { label: "European Commission · North Macedonia 2025 country report", href: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52025SC0753" },
    ],
  },
  mk: {
    eyebrow: "СКОПЈЕ · ЕКОНОМИЈА, ЖИВОТНА СРЕДИНА И ЛУЃЕ",
    title: "Што може да добие градот — и колку би чинело?",
    intro: "Долгорочниот скрининг-модел користи пријавени податоци за отпадот во Скопје и јавни меѓународни трошочни референци. Предвидениот опфат е целиот Град Скопје, во сите општини. Разликува избегната такса од нето-заштеда и покажува кои локални податоци недостигаат.",
    benefitsEyebrow: "МОЖНИ ПРИДОБИВКИ · ТРЕБА ДА СЕ ИЗМЕРАТ",
    benefitsTitle: "Вредноста за градот има повеќе мерки",
    benefits: [
      { title: "Локална економска вредност", icon: "МКД", points: ["Поврат на хартија, метали, стакло и прифатена пластика за локални или регионални производители кога ќе се потврдат квалитетот и договорите со купувачи.", "Можни приходи од договори за одговорност на производителите, продажба на материјали и измерена топлина или струја; моделот не ги прикажува како приход во Скопје.", "Создавање стручни локални работни места во собирање, селекција, одржување, мерење на животната средина и енергетско работење."] },
      { title: "Резултати за животната средина", icon: "↻", points: ["Прво спречување на отпадот, потоа повторна употреба и рециклирање; органскиот отпад се третира одделно кога има безбеден локален пласман.", "Помал остаточен тек може да ги намали тоните на депонија. Употребливата топлина или струја заменува друга енергија само ако потврден корисник ја користи.", "Следење на емисии од оџак, долен пепел, остатоци од пречистување на воздухот, одбиени товари и емисии во целиот животен циклус. Не се тврди нула емисии или заштеда на CO₂."] },
      { title: "Придобивки за жителите", icon: "⌂", points: ["Јасни насоки и пристапни собирни места може да го олеснат сортирањето за деца, постари лица и лица со попреченост.", "Почисти јавни простори и побезбедно, следливо ракување може да придонесат за здравјето и достоинството во населбите.", "Жителите треба да се консултираат за локацијата, камионските маршрути, бучавата, миризбите, достапноста, безбедноста на работниците и јавните резултати."] },
    ],
    localEyebrow: "ШТО ПОСТОИ ВО СКОПЈЕ ДЕНЕС",
    localTitle: "Корисна почетна точка, не доказ за слободен капацитет",
    localFacts: [
      { value: ">130.000 т/год.", title: "Отпад што оди во Дрисла", body: "ЈП Комунална хигиена-Скопје наведува дека над 130.000 тони комунален отпад годишно се транспортираат во Дрисла. Ова е оперативен контекст, не пошироката основа за 2023 во контролниот панел." },
      { value: "~66.000", title: "Активни корисници на централно греење", body: "ЕСМ пријави околу 65.000 домаќинства и над 1.000 деловни корисници приклучени на скопските системи за грејната сезона 2025/26. Тоа не докажува слободна побарувачка, капацитет на мрежата или договор за откуп." },
    ],
    readinessEyebrow: "ШТО СÈ УШТЕ ТРЕБА ДА СЕ РАЗРАБОТИ",
    readinessTitle: "Реши ги тесните грла пред избор на капацитет",
    readiness: [
      { title: "Сигурни податоци за отпадот", body: "Мерење и сезонско земање примероци од домаќинства и бизниси; одделно проверување на влажност, состав, калорична вредност, контаминација и диво фрлање." },
      { title: "Собирање на кое жителите може да му веруваат", body: "Практични садови, јасни насоки, одделни комори во камионите, сигурен распоред, буџет за поправки и човечка/рачна резервна постапка." },
      { title: "Договори пред опрема", body: "Потврдени купувачи за рециклабилни материјали, безбеден пласман на органскиот отпад, спецификации за термички остаток, откуп на топлина/струја и одговорност за одбивања и пепел." },
      { title: "Соодветна големина на третманот", body: "Термичкиот капацитет да не се одредува според денешниот мешан отпад. Преголемата постројка може да се натпреварува со спречувањето и рециклирањето и да го врзе градот со договори за снабдување." },
      { title: "Усогласување со топлинската мрежа", body: "Мапирање месечна побарувачка, температури, повратна вода, траси на цевки, мрежни приклучоци и капитални трошоци. Топлинска пумпа за канализациска или индустриска топлина бара посебна студија за изворот и перформансите." },
      { title: "Дозволи и заштита на јавноста", body: "Процена на локација, животна средина и општествено влијание, консултации, план за емисии и остатоци, континуирано мерење, итен одговор и јавни извештаи." },
      { title: "Финансирање и работа", body: "Споредба на јавна набавка, грантови, финансирање преку одговорност на производителите и ЈПП. Вклучување трошоци за целиот век, достапност, одржување, персонал, осигурување и затворање." },
    ],
    worldEyebrow: "МЕЃУНАРОДНИ ЛЕКЦИИ",
    worldTitle: "Преземи лекции, не големини на постројки",
    worldNote: "Овие градови имаат различен состав на отпад, цени на енергија, регулативи и топлински мрежи. Нивните резултати не се прогноза за Скопје.",
    sourceHeading: "Извори и белешки за моделот",
    extraSources: [
      { label: "ЕСМ · корисници на централно греење во Скопје, 2025/26", href: "https://www.esm.com.mk/?p=18124" },
      { label: "Комунална хигиена Скопје · собирање и контекст за Дрисла", href: "https://www.khigiena.com.mk/page/?id=7" },
      { label: "Рамковна директива на ЕУ · хиерархија на отпад", href: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=LEGISSUM%3Awaste_hierarchy" },
      { label: "ЕБОР · интегрирано ЈПП за отпадот во Винча, Белград", href: "https://www.ebrd.com/home/work-with-us/projects/psd/46758.html" },
      { label: "ОЕЦД · управување со отпад и лекции за циркуларна економија", href: "https://www.oecd.org/en/publications/waste-management-and-the-circular-economy-in-selected-oecd-countries_9789264309395-en/full-report/component-6.html" },
      { label: "Европска комисија · извештај за Северна Македонија 2025", href: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52025SC0753" },
    ],
  },
} as const;

export default function EconomicsPage() {
  const { language, t } = useLanguage();
  const text = pageCopy[language];
  const sources = [...impactSources[language], ...text.extraSources];

  return <div className="page-shell economics-shell">
    <section className="page-intro economics-intro"><span className="eyebrow">{text.eyebrow}</span><h1>{text.title}</h1><p>{text.intro}</p></section>

    <ImpactDashboard />

    <section className="impact-section" aria-labelledby="impact-title">
      <div className="section-heading-row"><div><span className="eyebrow">{text.benefitsEyebrow}</span><h2 id="impact-title">{text.benefitsTitle}</h2></div></div>
      <div className="impact-grid">{text.benefits.map((benefit) => <article className="impact-card" key={benefit.title}><span className="impact-icon" aria-hidden="true">{benefit.icon}</span><h3>{benefit.title}</h3><ul>{benefit.points.map((point) => <li key={point}>{point}</li>)}</ul></article>)}</div>
    </section>

    <section className="skopje-evidence-section">
      <div className="section-heading-row"><div><span className="eyebrow">{text.localEyebrow}</span><h2>{text.localTitle}</h2></div></div>
      <div className="local-evidence-grid">{text.localFacts.map((fact) => <article className="local-evidence-card" key={fact.title}><strong>{fact.value}</strong><h3>{fact.title}</h3><p>{fact.body}</p></article>)}</div>
    </section>

    <section className="readiness-economics-section">
      <div className="section-heading-row"><div><span className="eyebrow">{text.readinessEyebrow}</span><h2>{text.readinessTitle}</h2></div></div>
      <div className="readiness-economics-grid">{text.readiness.map((item, index) => <article className="readiness-economics-card" key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
    </section>

    <section className="world-section"><div className="section-heading-row"><div><span className="eyebrow">{text.worldEyebrow}</span><h2>{text.worldTitle}</h2></div><p>{text.worldNote}</p></div><div className="world-grid">{cityExamples.map((item, index) => <article className="world-card" key={item.title}><span className={`world-number world-number-${index}`}>0{index + 1}</span><span className="world-tag">{item.tag}</span><h3>{t(item.title)}</h3><p>{t(item.body)}</p><a href={item.href} target="_blank" rel="noreferrer">{t("learnMore")}</a></article>)}</div></section>

    <section className="research-sources"><h2>{text.sourceHeading}</h2><div className="source-links">{sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div></section>
  </div>;
}
