"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export function SkipToContent() {
  const { t } = useLanguage();
  return <a className="skip-link" href="#main-content">{t("skipToContent")}</a>;
}

export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label={t("brand")}>
        <span className="brand-mark" aria-hidden="true">↻</span>
        <span>{t("brand")}</span>
      </Link>
      <nav className="main-nav" aria-label={language === "mk" ? "Главна навигација" : "Main navigation"}>
        <Link href="/map">{t("navMap")}</Link>
        <Link href="/workflow">{t("navFlow")}</Link>
        <Link href="/economics">{t("navEconomics")}</Link>
      </nav>
      <div className="header-actions">
        <Link href="/join" className="header-join">{t("navJoin")} <span aria-hidden="true">↗</span></Link>
        <div className="language-switch" aria-label={language === "mk" ? "Избор на јазик" : "Language selection"}>
          <button type="button" aria-pressed={language === "mk"} onClick={() => setLanguage("mk")}>МК</button>
          <span aria-hidden="true">/</span>
          <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
        </div>
        <Link className="host-link" href="/host" aria-label={t("navHost")}>⌁</Link>
      </div>
    </header>
  );
}
