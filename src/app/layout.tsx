import "../globals.css";
import type { ReactNode } from "react";
import Script from "next/script";
import { getBaseMetadata } from "@/lib/seo/metadata";
import { siteGraph } from "@/lib/seo/schema";
import { resolveConfig } from "@/lib/seo/store";
import JsonLd from "@/components/JsonLd";
import MetaPixel from "@/components/MetaPixel";

export async function generateMetadata() {
  return getBaseMetadata();
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cfg = await resolveConfig();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=Caveat:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script src="/boot.js" strategy="beforeInteractive" />
        <JsonLd data={siteGraph(cfg)} />
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
