"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="footer-brand"><span className="brand-mark" aria-hidden="true">↻</span> {t("brand")}</div>
      <p>{t("footerNote")}</p>
      <div className="footer-links"><Link href="/map">{t("navMap")}</Link><Link href="/workflow">{t("navFlow")}</Link><Link href="/economics">{t("navEconomics")}</Link></div>
      <small>© 2026 · Skopje, North Macedonia</small>
    </footer>
  );
}
