"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useLanguage } from "@/components/language-provider";

const neighborhoods = [
  ["Центар", "Centar"], ["Карпош", "Karpoš"], ["Аеродром", "Aerodrom"], ["Кисела Вода", "Kisela Voda"],
  ["Чаир", "Čair"], ["Ѓорче Петров", "Gjorče Petrov"], ["Бутел", "Butel"], ["Гази Баба", "Gazi Baba"],
  ["Сарај", "Saraj"], ["Шуто Оризари", "Šuto Orizari"], ["Друго", "Other"],
] as const;
const options = ["paper", "plastic", "glass", "metal", "organics"] as const;

export default function JoinPage() {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const labels: Record<(typeof options)[number], string> = { paper: t("paper"), plastic: t("plastic"), glass: t("glass"), metal: t("metal"), organics: t("organics") };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("sending");
    setErrorMessage("");
    const form = new FormData(formElement);
    const payload = {
      fullName: String(form.get("fullName") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      contactChannel: String(form.get("contactChannel") ?? ""),
      neighborhood: String(form.get("neighborhood") ?? "") || null,
      materials: form.getAll("materials").map(String),
      consent: form.get("consent") === "on",
      website: String(form.get("website") ?? ""),
    };
    if (payload.materials.length === 0) {
      setStatus("error");
      setErrorMessage(t("selectMaterial"));
      return;
    }

    try {
      const response = await fetch("/api/interests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not submit interest");
      setStatus("success");
      formElement.reset();
    } catch {
      setStatus("error");
      setErrorMessage(t("formError"));
    }
  }

  return <div className="page-shell join-shell">
    <section className="page-intro join-intro"><span className="eyebrow">{language === "mk" ? "ПОЧНУВАМЕ СО СОСЕДИТЕ" : "STARTING WITH NEIGHBORS"}</span><h1>{t("joinTitle")}</h1><p>{t("joinBody")}</p></section>
    <div className="form-layout">
      <form className="interest-form" onSubmit={submit}>
        {status === "success" ? <div className="success-panel" role="status"><span>✓</span><h2>{t("successTitle")}</h2><p>{t("successBody")}</p><button type="button" className="text-link" onClick={() => setStatus("idle")}>{language === "mk" ? "Додади друго лице" : "Add another person"}</button></div> : <>
          <div className="form-section-title"><span>01</span><h2>{language === "mk" ? "Како да те најдеме" : "How to reach you"}</h2></div>
          <div className="form-grid"><label>{t("fullName")}<input name="fullName" type="text" autoComplete="name" minLength={2} maxLength={100} required /></label><label>{t("phone")}<input name="phone" type="tel" autoComplete="tel" placeholder="+389 7X XXX XXX" minLength={7} maxLength={30} required /></label></div>
          <div className="form-grid"><label>{t("contactChannel")}<select name="contactChannel" required defaultValue=""><option value="" disabled>{language === "mk" ? "Избери канал" : "Choose a channel"}</option><option value="call">{t("call")}</option><option value="sms">{t("sms")}</option><option value="viber">{t("viber")}</option><option value="whatsapp">{t("whatsapp")}</option></select></label><label>{t("neighborhood")}<select name="neighborhood" defaultValue=""><option value="">{t("chooseNeighborhood")}</option>{neighborhoods.map(([mk, en]) => <option key={mk} value={mk}>{language === "mk" ? mk : en}</option>)}</select></label></div>
          <div className="form-section-title section-title-spaced"><span>02</span><h2>{t("materialsInterest")}</h2></div>
          <div className="checkbox-grid">{options.map((material) => <label className="check-card" key={material}><input type="checkbox" name="materials" value={material} /><span className="fake-check">✓</span><span>{labels[material]}</span></label>)}</div>
          <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <label className="consent-row"><input name="consent" type="checkbox" required /><span>{t("consent")}</span></label>
          <p className="privacy-note">{t("dataPrivacy")}</p>
          {status === "error" && <p className="form-error" role="alert">{errorMessage || t("formError")}</p>}
          <button className="button button-dark submit-button" type="submit" disabled={status === "sending"}>{status === "sending" ? t("submitting") : t("submitInterest")} <span aria-hidden="true">↗</span></button>
        </>}
      </form>
      <aside className="join-aside"><div className="aside-art"><span>↻</span><i>♨</i><b>SK</b></div><span className="eyebrow">{language === "mk" ? "ПРИВАТНОСТА Е ВАЖНА" : "PRIVACY MATTERS"}</span><h2>{language === "mk" ? "Твоите податоци имаат јасна намена." : "Your information has a clear purpose."}</h2><p>{language === "mk" ? "Не бараме адреса на живеење. Пријавите се видливи само за овластени домаќини и може да се избришат." : "We do not ask for your home address. Signups are visible only to approved hosts and can be deleted."}</p><div className="aside-rule" /><p className="tiny-note">{language === "mk" ? "Ова не е комунална услуга и не резервира термин за подигнување." : "This is not a utility service and does not reserve a pickup time."}</p></aside>
    </div>
  </div>;
}
