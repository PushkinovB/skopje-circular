"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";

const keys = ["collector", "sorting", "recycling", "recovery", "heating"] as const;
const descriptions = ["workflowCollector", "workflowSorting", "workflowRecycling", "workflowRecovery", "workflowHeating"] as const;
const icons = ["↗", "◉", "↻", "♨", "⌂"];

export default function WorkflowPage() {
  const { t, language } = useLanguage();
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const [steps, setSteps] = useState([0]);
  const changeStep = (index: number) => {
    setActive(index);
    setStarted(true);
    setSteps((current) => [...new Set([...current, index])]);
  };

  return <div className="page-shell workflow-shell">
    <section className="page-intro workflow-intro"><span className="eyebrow">{language === "mk" ? "ПРЕДЛОЖЕНА ОПЕРАЦИЈА" : "PROPOSED OPERATIONS"}</span><h1>{t("workflowTitle")}</h1><p>{t("workflowIntro")}</p><span className="simulation-stamp">◉ {t("sampleLabel")}</span></section>
    <section className="workflow-board" aria-label={t("workflowTitle")}>
      <div className="workflow-topline"><div><span className="eyebrow">{language === "mk" ? "ПРИМЕРОК SC-024" : "SAMPLE SC-024"}</span><h2>{language === "mk" ? "Мешан материјал од домаќинство" : "Household material sample"}</h2></div><div className="sample-amount"><strong>24 kg</strong><small>{language === "mk" ? "синтетичка количина" : "synthetic quantity"}</small></div></div>
      <div className="workflow-progress" aria-label={language === "mk" ? "Чекори на симулацијата" : "Simulation steps"}>
        {keys.map((key, index) => <button type="button" key={key} className={`workflow-step ${active === index ? "active" : ""} ${steps.includes(index) ? "visited" : ""}`} onClick={() => changeStep(index)} aria-current={active === index ? "step" : undefined}><span className="step-icon">{icons[index]}</span><span className="step-index">0{index + 1}</span><b>{t(key)}</b>{index < keys.length - 1 && <i className="step-connector" aria-hidden="true" />}</button>)}
      </div>
      <div className="workflow-detail" key={active}><div className={`detail-symbol symbol-${active}`}>{icons[active]}</div><div className="detail-copy"><span className="eyebrow">{language === "mk" ? `ЧЕКОР 0${active + 1}` : `STEP 0${active + 1}`}</span><h3>{t(keys[active])}</h3><p>{t(descriptions[active])}</p><span className="proposed-chip">{language === "mk" ? "ИЛУСТРАТИВНО · ПРЕДЛОЖЕНО" : "ILLUSTRATIVE · PROPOSED"}</span></div><div className="detail-data"><small>{language === "mk" ? "СТАТУС НА ПРИМЕРОКОТ" : "SAMPLE STATUS"}</small><b>{started ? (language === "mk" ? "СЕМИМУЛИРА" : "SIMULATING") : (language === "mk" ? "ПОДГОТВЕНО" : "READY")}</b><p>{language === "mk" ? "Без GPS, диспетчеризација или партнерски податоци." : "No GPS, dispatch or partner data."}</p></div></div>
      <div className="workflow-controls"><button type="button" className="button button-light" onClick={() => changeStep(Math.max(0, active - 1))} disabled={active === 0}>← {language === "mk" ? "Претходно" : "Previous"}</button><span>{language === "mk" ? "Избери чекор за детали" : "Select a step for details"}</span><button type="button" className="button button-dark" onClick={() => changeStep((active + 1) % keys.length)}>{active === keys.length - 1 ? (language === "mk" ? "Почни одново" : "Start again") : (language === "mk" ? "Следно" : "Next")} <span aria-hidden="true">→</span></button></div>
    </section>
    <section className="stream-grid"><article><span className="stream-icon stream-green">↻</span><h2>{language === "mk" ? "Рециклирај" : "Recycle"}</h2><p>{language === "mk" ? "Хартија, метал, стакло и пластика кога се правилно одвоени и имаат пат до рециклатор." : "Paper, metal, glass and plastics when they are separated properly and have a route to a recycler."}</p></article><article><span className="stream-icon stream-orange">♨</span><h2>{language === "mk" ? "Биогас" : "Biogas"}</h2><p>{language === "mk" ? "Одделно собрани органски материјали може да се разгледаат за анаеробно варење и биогас." : "Separately collected organics may be considered for anaerobic digestion and biogas."}</p></article><article><span className="stream-icon stream-blue">⌂</span><h2>{language === "mk" ? "Преостаната енергија" : "Residual energy"}</h2><p>{language === "mk" ? "Енергетско искористување се разгледува само за остатокот што не може да се спречи, реупотреби или рециклира." : "Energy recovery is considered only for residual material that cannot be prevented, reused or recycled."}</p></article></section>
    <div className="page-note">{language === "mk" ? "Сите возила, количества, постројки и роботи се сценарио за демонстрација. Не претставуваат реален сервис во Скопје." : "All vehicles, quantities, facilities and robots are a demonstration scenario. They do not represent a real service in Skopje."}</div>
  </div>;
}
