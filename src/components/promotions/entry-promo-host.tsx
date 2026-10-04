"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { PublicPromotion } from "@/lib/promotions/promotion-service";

const EntryPromoModal = dynamic(
  () => import("@/components/promotions/entry-promo-modal").then((m) => m.EntryPromoModal),
  { ssr: false },
);

function storageKey(promotion: PublicPromotion) {
  return promotion.frequency === "DAILY" ? `osool-promo-daily-${promotion.id}` : `osool-promo-session-${promotion.id}`;
}

function shouldShow(promotion: PublicPromotion) {
  if (typeof window === "undefined") return false;
  const key = storageKey(promotion);
  if (promotion.frequency === "DAILY") {
    const raw = localStorage.getItem(key);
    if (!raw) return true;
    const last = Number(raw);
    return Date.now() - last > 24 * 60 * 60 * 1000;
  }
  return !sessionStorage.getItem(key);
}

function localizePromotion(promotion: PublicPromotion, locale: "ar" | "en"): PublicPromotion {
  const swap = (url: string) => {
    if (locale === "en" && url.startsWith("/ar/")) return url.replace(/^\/ar/, "/en");
    if (locale === "ar" && url.startsWith("/en/")) return url.replace(/^\/en/, "/ar");
    return url;
  };
  return {
    ...promotion,
    primaryCtaUrl: swap(promotion.primaryCtaUrl),
    secondaryCtaUrl: promotion.secondaryCtaUrl ? swap(promotion.secondaryCtaUrl) : null,
    titleAr: promotion.titleAr,
    titleEn: promotion.titleEn,
  };
}

function markShown(promotion: PublicPromotion) {
  const key = storageKey(promotion);
  if (promotion.frequency === "DAILY") localStorage.setItem(key, String(Date.now()));
  else sessionStorage.setItem(key, "1");
}

export function EntryPromoHost({ locale }: { locale: "ar" | "en" }) {
  const [promotion, setPromotion] = useState<PublicPromotion | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    fetch("/api/promotions/active")
      .then((r) => r.json())
      .then((data: { promotion: PublicPromotion | null }) => {
        if (cancelled || !data.promotion) return;
        const p = data.promotion;
        if (isMobile && !p.mobileEnabled) return;
        if (!isMobile && !p.desktopEnabled) return;
        if (!shouldShow(p)) return;
        window.setTimeout(() => {
          if (!cancelled) {
            const localized = localizePromotion(p, locale);
            setPromotion(localized);
            setOpen(true);
            markShown(p);
          }
        }, 1000);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (!open || !promotion) return null;

  return (
    <EntryPromoModal
      locale={locale}
      promotion={promotion}
      onClose={() => {
        setOpen(false);
        setPromotion(null);
      }}
    />
  );
}
