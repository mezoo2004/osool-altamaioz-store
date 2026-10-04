"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics/events";
import type { PublicPromotion } from "@/lib/promotions/promotion-service";
import { cn } from "@/lib/utils";

type EntryPromoModalProps = {
  locale: "ar" | "en";
  promotion: PublicPromotion;
  forceOpen?: boolean;
  onClose: () => void;
};

function promoCopy(promotion: PublicPromotion, locale: "ar" | "en") {
  const title = locale === "ar" ? promotion.titleAr : promotion.titleEn;
  let subtitle = locale === "ar" ? promotion.subtitleAr : promotion.subtitleEn;
  if (!subtitle) {
    if (promotion.discountPercentClaim != null) {
      subtitle =
        locale === "ar"
          ? `خصومات تصل إلى ${promotion.discountPercentClaim}%`
          : `Save up to ${promotion.discountPercentClaim}%`;
    } else {
      subtitle = locale === "ar" ? "عروض مختارة على منتجات الإنارة" : "Selected lighting offers";
    }
  }
  return { title, subtitle };
}

export function EntryPromoModal({ locale, promotion, forceOpen = false, onClose }: EntryPromoModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { title, subtitle } = promoCopy(promotion, locale);
  const primaryLabel = locale === "ar" ? promotion.primaryCtaLabelAr : promotion.primaryCtaLabelEn;
  const secondaryLabel =
    locale === "ar" ? promotion.secondaryCtaLabelAr : promotion.secondaryCtaLabelEn;

  useEffect(() => {
    if (forceOpen) return;
    trackAnalyticsEvent("promotion_shown", { promotionId: promotion.id });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [forceOpen, promotion.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center p-4",
        forceOpen && "relative inset-auto min-h-[300px] z-0 p-2",
      )}
      role="presentation"
    >
      {!forceOpen && <button type="button" className="absolute inset-0 bg-black/55" aria-label="Close" onClick={onClose} />}
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
      >
        <button
          type="button"
          onClick={() => {
            trackAnalyticsEvent("promotion_closed", { promotionId: promotion.id });
            onClose();
          }}
          className="absolute end-3 top-3 z-10 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white"
          aria-label={locale === "ar" ? "إغلاق" : "Close"}
        >
          ×
        </button>
        {promotion.imageUrl && (
          <div className="relative h-44 w-full bg-[#f3f3f1]">
            <Image src={promotion.imageUrl} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="space-y-4 p-6">
          <p className="text-xs tracking-[0.18em] text-black/45">OSOOL ALTAMAIOZ</p>
          <h2 id={titleId} className="text-2xl font-semibold leading-tight">
            {title}
          </h2>
          <p className="text-sm text-black/65">{subtitle}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={promotion.primaryCtaUrl}
              onClick={() => trackAnalyticsEvent("promotion_cta_clicked", { promotionId: promotion.id, cta: "primary" })}
              className="inline-flex justify-center rounded-full bg-[#EA5A2D] px-5 py-2.5 text-sm font-medium text-white"
            >
              {primaryLabel}
            </Link>
            {secondaryLabel && promotion.secondaryCtaUrl && (
              <Link
                href={promotion.secondaryCtaUrl}
                onClick={() => trackAnalyticsEvent("promotion_cta_clicked", { promotionId: promotion.id, cta: "secondary" })}
                className="inline-flex justify-center rounded-full border border-black/15 px-5 py-2.5 text-sm"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
