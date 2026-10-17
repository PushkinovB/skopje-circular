import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { SiteHeader, SkipToContent } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Skopje Circular — A circular future for the city",
  description: "A bilingual concept demo for verified recycling points and a proposed circular waste-to-heat system in Skopje.",
  applicationName: "Skopje Circular",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mk">
      <body>
        <LanguageProvider>
          <SkipToContent />
          <SiteHeader />
          <main id="main-content" tabIndex={-1}>{children}</main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
