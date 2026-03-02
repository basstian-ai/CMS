import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Manrope } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { isPublicRedesignEnabled } from "@/lib/site/public-redesign";

import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Bykirken · CMS",
  description: "Monolitt for Bykirken frontend og CMS.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const shouldEnableAnalytics = isPublicRedesignEnabled();

  return (
    <html lang="no" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="font-body">
        {children}
        {shouldEnableAnalytics ? (
          <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
        ) : null}
        <SpeedInsights />
      </body>
    </html>
  );
}
