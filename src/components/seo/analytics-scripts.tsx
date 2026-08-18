"use client";

import Script from "next/script";

const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();
const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();

export function AnalyticsScripts() {
  if (!gaId && !gtmId) return null;

  return (
    <>
      {gtmId && (
        <>
          <Script id="gtm-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
          `}</Script>
          <Script
            id="gtm-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
          />
        </>
      )}
      {gaId && !gtmId && (
        <>
          <Script
            id="ga4-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', { send_page_view: false });
          `}</Script>
        </>
      )}
    </>
  );
}
