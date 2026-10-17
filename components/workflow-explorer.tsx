"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";

const copy = {
  en: {
    eyebrow: "PROPOSED OPERATING MODEL · SKOPJE ONLY",
    intro: "Follow one material batch from a resident’s sorting decision to a measured destination. The proposed service scope is the whole City of Skopje across all municipalities; sequencing and coverage depend on local coordination. Each handoff has an owner, a record and a check before the next step can proceed.",
    sample: "CONCEPT ONLY · NO LIVE VEHICLES, FACILITIES OR PARTNER DATA",
    selectStep: "Choose a step to see its input, action, output and handoff.",
    input: "INPUT",
    action: "WHAT HAPPENS",
    output: "OUTPUT TO THE NEXT STEP",
    handoff: "HANDOFF / CONTROL",
    candidate: "Illustrative technology candidate",
    proposed: "Proposed process",
    control: "Decision gates before investment",
    controlIntro: "These checks should be completed in order. If a check fails, the flow pauses or uses an approved manual route; it does not send waste automatically to thermal treatment.",
    loops: "The data loop closes the system",
    loopBody: "Every weighbridge ticket, material-quality check, recycler receipt, residue manifest, emissions report and heat meter reading updates the batch record. Aggregated results feed back into collection schedules, resident guidance and the next investment decision.",
    noService: "This is an illustrative prototype. It does not dispatch trucks, operate robots, accept waste, sell energy or provide heating in Skopje.",
    streamsTitle: "Three distinct material routes",
    streamsIntro: "Keep saleable materials and organics out of the residual-energy route.",
    routes: [
      { title: "Recyclables", body: "Verified paper, metals, glass and accepted plastics go to contracted reprocessors. Rejects are weighed and reported." },
      { title: "Organics", body: "Clean, separately collected food and garden waste can go to composting or anaerobic digestion when a local operator and product outlet are secured." },
      { title: "Residual only", body: "Only material left after prevention, reuse and recycling is assessed for energy recovery, subject to permits, emissions controls, heat or power buyers and a residuals plan." },
      { title: "Special / rejected", body: "Hazardous, contaminated or technically unsuitable loads follow a licensed alternative route. Bottom ash and air-pollution-control residues are tracked to approved treatment or disposal." },
    ],
    gates: [
      { title: "1. Measure the waste", body: "Seasonal composition, moisture, calorific value, contamination and actual collection tonnage for the City of Skopje." },
      { title: "2. Prove the higher routes", body: "Separate collection, repair/reuse, recycling capacity, organics treatment and signed off-take contracts come before residual-plant sizing." },
      { title: "3. Secure the energy users", body: "A heat-load study by month, network temperatures, connection cost, grid capacity and enforceable heat/power purchase terms." },
      { title: "4. Permit and protect", body: "Site selection, environmental and social assessment, public consultation, continuous emissions monitoring, ash handling and emergency plans." },
      { title: "5. Make it financeable", body: "Independent cost estimate, procurement/PPP options, affordability analysis, operator accountability, maintenance and a manual continuity plan." },
    ],
    steps: [
      { title: "Resident separation", tag: "01", technology: "Existing local collection + clear sorting guidance", input: "Household and business discards, plus verified point locations and accepted-material rules.", action: "Residents keep reusable items, clean recyclables and organics separate where collection routes exist. The public map shows only verified options.", output: "A source-separated load with a material label and origin area; no home address is needed in the public demo.", handoff: "The city/producer-responsibility operator confirms materials, container types, service area and collection calendar before a resident is told to use a point.", candidate: false },
      { title: "Smart collection points", tag: "02", technology: "Bin-e smart-bin concept (candidate; not a partner)", input: "Separated material in containers, plus optional fill-level and fault signals.", action: "A sensor can report capacity and equipment condition. Computer vision or a smart bin may assist sorting, but resident instructions and a manual inspection remain available.", output: "A timestamped fill estimate and service request linked to a bin ID, not a person’s identity.", handoff: "Sensors are optional. If a sensor fails, scheduled inspection and collection continue; privacy, accessibility and maintenance costs need review.", candidate: true },
      { title: "Route planning and pickup", tag: "03", technology: "Current municipal fleet first; EV / Einride concepts later", input: "Container fill reports, agreed pickup days, vehicle capacity, road access and separate-stream rules.", action: "Dispatch groups stops by material and route. Vehicles use separate compartments or sealed totes to preserve material quality.", output: "A collection manifest with stop, time, stream, vehicle and estimated weight.", handoff: "A human dispatcher and driver remain in control. Autonomous fleet technology is a future option requiring safety, labor, road and procurement review.", candidate: true },
      { title: "Facility receiving", tag: "04", technology: "Proposed weighbridge, inspection and batch record", input: "Vehicle manifest and separated load.", action: "A facility would weigh in/out, inspect load quality, record contamination and assign a batch identifier before unloading.", output: "Verified net tonnes by material, quality grade and origin route.", handoff: "Out-of-spec loads are quarantined or sent to an approved fallback. A weighbridge ticket reconciles the vehicle manifest.", candidate: false },
      { title: "Sorting and quality control", tag: "05", technology: "Conveyors + optical sorting; NVIDIA / Figure are candidates only", input: "Weighed recyclable and residual loads with batch IDs.", action: "Mechanical and optical sorting separate materials. AI can assist with recognition; trained staff verify quality, clear jams and stop unsafe equipment.", output: "A measured mass balance: recovered materials, organics, residuals, rejects and process loss.", handoff: "No 99.4% accuracy or zero-contamination result is assumed. Pilot tests must measure capture, contamination, uptime, worker safety and reject rates.", candidate: true },
      { title: "Material and organics outlets", tag: "06", technology: "Reprocessors + compost / anaerobic-digestion operators", input: "Sorted material bales, separate organics and residual fraction.", action: "Clean materials go to confirmed buyers. Organics go to compost or biogas only where process capacity and product outlets are proven.", output: "Acceptance receipts, saleable material quantities, compost/digestate or biogas records, and documented rejects.", handoff: "Contracts specify quality, volumes, prices, transport and rejected-load responsibility. Material value is not counted before those terms exist.", candidate: false },
      { title: "Residual energy recovery", tag: "07", technology: "Martin GmbH is a reference candidate, not a selected supplier", input: "Only the audited, non-recyclable residual fraction that meets a facility’s permit and feed specification.", action: "If a feasibility study passes, a permitted CHP plant could make electricity and usable heat with flue-gas treatment and continuous emissions checks.", output: "Metered electricity and heat, bottom ash, air-pollution-control residues and verified emissions data.", handoff: "Thermal treatment is not the automatic destination. Unburnable/rejected waste and all process residues require a licensed route and auditable records.", candidate: true },
      { title: "Heat, power and reporting", tag: "08", technology: "ESM / EVN / MEPSO interfaces are unconfirmed; heat pumps are an option", input: "Metered energy, a confirmed heat load, connection studies and grid/network agreements.", action: "Power could connect to the grid. Heat could connect to a suitable district network; heat pumps may upgrade suitable sewage or industrial waste heat.", output: "Delivered MWh by meter, customer service data, verified invoices and an annual public mass/energy/emissions report.", handoff: "Seasonal cavern storage is only a later study after geology, safety, efficiency and cost checks. Heat is credited only when a customer actually uses it.", candidate: true },
    ],
  },
  mk: {
    eyebrow: "ПРЕДЛОЖЕН РАБОТЕН МОДЕЛ · САМО СКОПЈЕ",
    intro: "Следи една серија материјал од одлуката на жителот до измерената дестинација. Предложениот опфат е целиот Град Скопје во сите општини; фазите и покриеноста зависат од локална координација. Секое предавање има одговорен субјект, запис и проверка пред следниот чекор.",
    sample: "САМО КОНЦЕПТ · НЕМА АКТИВНИ ВОЗИЛА, ПОСТРОЈКИ ИЛИ ПАРТНЕРСКИ ПОДАТОЦИ",
    selectStep: "Избери чекор за да ги видиш влезот, дејството, излезот и предавањето.",
    input: "ВЛЕЗ",
    action: "ШТО СЕ СЛУЧУВА",
    output: "ИЗЛЕЗ КОН СЛЕДНИОТ ЧЕКОР",
    handoff: "ПРЕДАВАЊЕ / КОНТРОЛА",
    candidate: "Илустративен технолошки кандидат",
    proposed: "Предложен процес",
    control: "Проверки пред инвестиција",
    controlIntro: "Проверките се завршуваат по ред. Ако некоја не помине, текот запира или користи одобрена рачна постапка; отпадот не се испраќа автоматски на термички третман.",
    loops: "Податочниот циклус го затвора системот",
    loopBody: "Секоја мерна лента, проверка на квалитет, потврда од рециклатор, манифест за остатоци, извештај за емисии и отчитување на мерач за топлина го ажурира записот за серијата. Збирните резултати ги подобруваат распоредите, насоките за жителите и следната инвестициска одлука.",
    noService: "Ова е илустративен прототип. Не испраќа камиони, не управува со роботи, не прима отпад, не продава енергија и не грее домови во Скопје.",
    streamsTitle: "Три различни текови на материјали",
    streamsIntro: "Материјалите за продажба и органскиот отпад да останат надвор од текот за енергетско искористување.",
    routes: [
      { title: "Материјали за рециклирање", body: "Проверена хартија, метали, стакло и прифатена пластика одат кај договорени преработувачи. Одбиените количини се мерат и пријавуваат." },
      { title: "Органски отпад", body: "Чист одделно собран отпад од храна и градини може да оди на компостирање или анаеробна дигестија кога има локален оператор и потврден пласман." },
      { title: "Само остаток", body: "Енергетско искористување се разгледува само за материјалот што преостанува по спречување, повторна употреба и рециклирање, со дозволи, контрола на емисии, купувачи за топлина/струја и план за остатоци." },
      { title: "Посебен / одбиен отпад", body: "Опасните, контаминираните или технички несоодветните товари одат по лиценциран алтернативен пат. Долниот пепел и остатоците од пречистување на воздухот се следат до одобрена обработка или депонирање." },
    ],
    gates: [
      { title: "1. Измери го отпадот", body: "Сезонски состав, влажност, калорична вредност, контаминација и реални количини собрани во Град Скопје." },
      { title: "2. Докажи ги повисоките текови", body: "Одделно собирање, поправка/повторна употреба, капацитет за рециклирање, третман на органски отпад и потпишани договори се пред одредувањето на капацитетот за остаток." },
      { title: "3. Обезбеди корисници на енергија", body: "Студија за месечна побарувачка на топлина, температури на мрежата, трошок за приклучување, капацитет на мрежата и извршни договори за откуп." },
      { title: "4. Дозволи и заштита", body: "Избор на локација, процена на влијанието врз животната средина и заедницата, јавни консултации, континуирано мерење емисии, пепел и планови за итни случаи." },
      { title: "5. Обезбеди финансирање", body: "Независна процена на трошоците, јавна набавка/ЈПП опции, анализи на достапност, одговорност на операторот, одржување и рачен план за континуитет." },
    ],
    steps: [
      { title: "Одвојување кај жителот", tag: "01", technology: "Постојно локално собирање + јасни насоки за селекција", input: "Отпад од домаќинства и бизниси, проверени локации и правила за прифатени материјали.", action: "Жителите одвојуваат предмети за повторна употреба, чисти материјали за рециклирање и органски отпад каде што постојат услуги. Јавната мапа прикажува само проверени опции.", output: "Одделен товар со ознака на материјал и подрачје на потекло; јавната демо-страница не бара домашна адреса.", handoff: "Градот/операторот за одговорност на производителите потврдува материјали, садови, опфат и распоред пред жителите да добијат насоки.", candidate: false },
      { title: "Паметни собирни места", tag: "02", technology: "Концепт на паметна канта Bin-e (кандидат; не е партнер)", input: "Одделен материјал во садови, со опционални сигнали за полност и дефект.", action: "Сензор може да испрати податок за капацитет и состојба. Компјутерски вид или паметна канта може да помогне во селекција, но достапни остануваат јасни насоки и рачна проверка.", output: "Временски означена процена за полност и барање услуга врзано со ID на садот, не со идентитет на лице.", handoff: "Сензорите се опционални. При дефект продолжува планираната проверка и собирање; треба да се оценат приватноста, пристапноста и одржувањето.", candidate: true },
      { title: "Планирање маршрути и подигање", tag: "03", technology: "Прво постојната градска флота; подоцна ЕВ / концепти на Einride", input: "Извештаи за полност, договорени денови, капацитет на возило, пристапност на пат и правила за одделни текови.", action: "Диспечерот ги групира постојките по материјал и маршрута. Возилата користат посебни комори или затворени садови за зачувување на квалитетот.", output: "Манифест за собирање: постојка, време, тек, возило и проценета тежина.", handoff: "Човечки диспечер и возач остануваат одговорни. Автономна флота е идно решение за процена на безбедност, работни места, патишта и набавка.", candidate: true },
      { title: "Прием во постројка", tag: "04", technology: "Предложена мерна лента, проверка и запис за серија", input: "Манифест на возилото и одделен товар.", action: "Постројка би мерела при влез/излез, би проверила квалитет, контаминација и би доделила ID на серијата пред истовар.", output: "Потврдени нето-тони по материјал, квалитет и маршрута на потекло.", handoff: "Несоодветните товари се изолираат или се испраќаат на одобрен резервен пат. Мерниот билет се усогласува со манифестот.", candidate: false },
      { title: "Селекција и контрола на квалитет", tag: "05", technology: "Транспортери + оптичка селекција; NVIDIA / Figure се само кандидати", input: "Измерени товари за рециклирање и остаток со ID на серија.", action: "Механичката и оптичката селекција ги раздвојуваат материјалите. ВИ може да помага во препознавање; обучен персонал ја проверува чистотата, ги отстранува заглавувањата и запира небезбедна опрема.", output: "Измерен материјален биланс: повратени материјали, органски отпад, остаток, одбивања и загуби во процесот.", handoff: "Не се претпоставуваат точност од 99,4% или нулта контаминација. Пилот мора да измери принос, контаминација, достапност, безбедност и стапка на одбивање.", candidate: true },
      { title: "Материјални и органски пазари", tag: "06", technology: "Преработувачи + компостирање / анаеробна дигестија", input: "Балирани материјали, одделно собран органски отпад и остаточна фракција.", action: "Чистите материјали одат кај потврдени купувачи. Органскиот отпад оди на компост или биогас само кога се докажани капацитетот и пласманот.", output: "Потврди за прием, количини за продажба, компост/дигестат или биогас и документирани одбивања.", handoff: "Договорите одредуваат квалитет, количини, цени, превоз и одговорност за одбиен товар. Вредноста на материјалот не се брои пред да постојат тие услови.", candidate: false },
      { title: "Енергетско искористување на остатокот", tag: "07", technology: "Martin GmbH е референтен кандидат, не избран добавувач", input: "Само проверената нерециклабилна фракција што ги исполнува дозволите и спецификациите на постројката.", action: "Ако студијата за изводливост помине, дозволена CHP-постројка може да произведува струја и употреблива топлина со пречистување на гасови и континуирани проверки на емисии.", output: "Измерена струја и топлина, долен пепел, остатоци од контрола на загадување на воздухот и проверени емисии.", handoff: "Термичкиот третман не е автоматска дестинација. Несогорливиот/одбиениот отпад и сите остатоци бараат лиценциран пат и проверлива евиденција.", candidate: true },
      { title: "Топлина, струја и известување", tag: "08", technology: "Врските со ЕСМ / ЕВН / МЕПСО се непотврдени; топлинските пумпи се опција", input: "Измерена енергија, потврдена побарувачка на топлина, студии за приклучување и договори со мрежите.", action: "Струјата може да се приклучи на мрежа. Топлината може да оди во соодветен систем за централно греење; пумпи може да ја покачат температурата на канализациска или индустриска отпадна топлина.", output: "Испорачани MWh по мерач, податоци за корисници, проверени фактури и годишен јавен извештај за материјали/енергија/емисии.", handoff: "Сезонско складирање во карпа/каверна е само подоцнежна студија по геолошка, безбедносна, ефикасносна и ценовна проверка. Топлината се признава само кога купувач навистина ја користи.", candidate: true },
    ],
  },
} as const;

export function WorkflowExplorer() {
  const { language } = useLanguage();
  const text = copy[language];
  const [activeStep, setActiveStep] = useState(0);
  const step = text.steps[activeStep];

  return (
    <div className="workflow-explorer">
      <section className="page-intro workflow-intro">
        <span className="eyebrow">{text.eyebrow}</span>
        <h1>{language === "mk" ? "Како еден чекор се поврзува со следниот" : "How each step connects to the next"}</h1>
        <p>{text.intro}</p>
        <span className="simulation-stamp" role="note">{text.sample}</span>
      </section>

      <section className="connection-section" aria-label={language === "mk" ? "Поврзани чекори на системот" : "Connected system steps"}>
        <ol className="connection-rail">
          {text.steps.map((item, index) => (
            <li className={`connection-node ${index === activeStep ? "selected" : ""}`} key={item.tag}>
              <button type="button" className="connection-button" aria-pressed={index === activeStep} aria-controls="connection-detail" onClick={() => setActiveStep(index)}>
                <span className="connection-number">{item.tag}</span>
                <span className="connection-label">{item.title}</span>
                <span className="connection-tech">{item.technology}</span>
                {index < text.steps.length - 1 ? <span className="connection-arrow" aria-hidden="true">↓</span> : null}
              </button>
            </li>
          ))}
        </ol>

        <article className="connection-detail" id="connection-detail" aria-live="polite">
          <div className="connection-detail-heading"><span className="eyebrow">{language === "mk" ? `ЧЕКОР ${step.tag}` : `STEP ${step.tag}`}</span><span className={`status-chip ${step.candidate ? "candidate-chip" : "proposed-chip"}`}>{step.candidate ? text.candidate : text.proposed}</span></div>
          <h2>{step.title}</h2>
          <dl className="handoff-grid">
            <div><dt>{text.input}</dt><dd>{step.input}</dd></div>
            <div><dt>{text.action}</dt><dd>{step.action}</dd></div>
            <div><dt>{text.output}</dt><dd>{step.output}</dd></div>
            <div className="handoff-control"><dt>{text.handoff}</dt><dd>{step.handoff}</dd></div>
          </dl>
          <p className="step-selection-hint">{text.selectStep}</p>
        </article>
      </section>

      <section className="stream-routing-section">
        <div className="section-heading-row"><div><span className="eyebrow">{language === "mk" ? "ПО СЕЛЕКЦИЈАТА" : "AFTER SORTING"}</span><h2>{text.streamsTitle}</h2><p className="muted">{text.streamsIntro}</p></div></div>
        <div className="stream-route-grid">{text.routes.map((route, index) => <article className={`stream-route-card stream-route-${index}`} key={route.title}><span className="route-index">0{index + 1}</span><h3>{route.title}</h3><p>{route.body}</p></article>)}</div>
      </section>

      <section className="readiness-section">
        <div className="section-heading-row"><div><span className="eyebrow">{language === "mk" ? "ПРЕД ИЗГРАДБА" : "BEFORE BUILDING"}</span><h2>{text.control}</h2><p className="muted">{text.controlIntro}</p></div></div>
        <ol className="readiness-list">{text.gates.map((gate) => <li key={gate.title}><h3>{gate.title}</h3><p>{gate.body}</p></li>)}</ol>
      </section>

      <section className="feedback-loop"><span className="loop-symbol" aria-hidden="true">↻</span><div><h2>{text.loops}</h2><p>{text.loopBody}</p></div></section>
      <p className="page-note workflow-disclaimer">{text.noService}</p>
    </div>
  );
}
