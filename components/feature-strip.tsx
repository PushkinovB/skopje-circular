"use client";

import { useLanguage } from "@/components/language-provider";

export function FeatureStrip() {
  const { language } = useLanguage();
  const items = language === "mk"
    ? [["01", "Проверени места", "Со извор и датум на проверка"], ["02", "Пилот по интерес", "Без лажни ветувања за подигнување"], ["03", "Циркуларна логика", "Рециклирај пред енергетско искористување"]]
    : [["01", "Verified locations", "With sources and check dates"], ["02", "Pilot by interest", "No false pickup promises"], ["03", "Circular by design", "Recycle before energy recovery"]];
  return <section className="feature-strip" aria-label={language === "mk" ? "Клучни принципи" : "Key principles"}>{items.map(([n, title, detail]) => <div className="feature-item" key={n}><span>{n}</span><div><b>{title}</b><small>{detail}</small></div></div>)}</section>;
}
