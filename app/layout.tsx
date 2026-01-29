import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bykirken · CMS",
  description: "Monolitt for Bykirken frontend og CMS.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no" className={inter.className}>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
