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
  previewMode?: "desktop" | "mobile";
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

export function EntryPromoModal({
  locale,
  promotion,
  forceOpen = false,
  previewMode,
  onClose,
}: EntryPromoModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { title, subtitle } = promoCopy(promotion, locale);
  const primaryLabel = locale === "ar" ? promotion.primaryCtaLabelAr : promotion.primaryCtaLabelEn;
  const secondaryLabel =
    locale === "ar" ? promotion.secondaryCtaLabelAr : promotion.secondaryCtaLabelEn;
  const theme = promotion.theme;
  const isMobilePreview = previewMode === "mobile";
  const heroImage =
    isMobilePreview && promotion.imageUrlMobile
      ? promotion.imageUrlMobile
      : promotion.imageUrl ?? promotion.imageUrlMobile;

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

  const overlayOpacity = Math.min(100, Math.max(0, theme.overlayStrength)) / 100;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center p-4",
        forceOpen && "relative inset-auto min-h-[300px] z-0 p-2",
        isMobilePreview && forceOpen && "max-w-[390px] mx-auto",
      )}
      role="presentation"
    >
      {!forceOpen && (
        <button
          type="button"
          className="absolute inset-0"
          style={{ backgroundColor: theme.overlayColor, opacity: overlayOpacity }}
          aria-label="Close"
          onClick={onClose}
        />
      )}
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl shadow-2xl outline-none",
          isMobilePreview ? "max-w-sm" : "max-w-lg",
        )}
        style={{
          backgroundColor: theme.popupBackground,
          border: `1px solid ${theme.borderColor}`,
          backgroundImage: theme.backgroundImageUrl
            ? `url(${theme.backgroundImageUrl})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: theme.backgroundPosition,
        }}
      >
        <button
          type="button"
          onClick={() => {
            trackAnalyticsEvent("promotion_closed", { promotionId: promotion.id });
            onClose();
          }}
          className="absolute end-3 top-3 z-10 rounded-full px-2.5 py-1 text-xs"
          style={{
            backgroundColor: theme.closeButtonColor,
            color: theme.closeButtonText,
          }}
          aria-label={locale === "ar" ? "إغلاق" : "Close"}
        >
          ×
        </button>
        {heroImage && (
          <div className="relative h-44 w-full">
            <Image src={heroImage} alt="" fill className="object-cover" unoptimized={forceOpen} />
          </div>
        )}
        <div className="space-y-4 p-6">
          <p className="text-xs tracking-[0.18em]" style={{ color: theme.accentLineColor }}>
            OSOOL ALTAMAIOZ
          </p>
          <h2 id={titleId} className="text-2xl font-semibold leading-tight" style={{ color: theme.textColor }}>
            {title}
          </h2>
          <p className="text-sm" style={{ color: theme.subtitleColor }}>
            {subtitle}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={promotion.primaryCtaUrl}
              onClick={(e) => {
                if (forceOpen) e.preventDefault();
                trackAnalyticsEvent("promotion_cta_clicked", { promotionId: promotion.id, cta: "primary" });
              }}
              className="inline-flex justify-center rounded-full px-5 py-2.5 text-sm font-medium"
              style={{ backgroundColor: theme.primaryCtaBg, color: theme.primaryCtaText }}
            >
              {primaryLabel}
            </Link>
            {secondaryLabel && promotion.secondaryCtaUrl && (
              <Link
                href={promotion.secondaryCtaUrl}
                onClick={(e) => {
                  if (forceOpen) e.preventDefault();
                  trackAnalyticsEvent("promotion_cta_clicked", { promotionId: promotion.id, cta: "secondary" });
                }}
                className="inline-flex justify-center rounded-full border px-5 py-2.5 text-sm"
                style={{
                  backgroundColor: theme.secondaryCtaBg,
                  color: theme.secondaryCtaText,
                  borderColor: theme.borderColor,
                }}
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
