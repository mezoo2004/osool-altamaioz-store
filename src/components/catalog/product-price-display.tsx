"use client";

import { isNationalDayCampaignActive } from "@/lib/campaigns/saudi-national-day";
import type { PriceDisplay } from "@/lib/catalog/display";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type ProductPriceDisplayProps = {
  price: PriceDisplay;
  locale: string;
  size?: "card" | "pdp";
  muted?: boolean;
  className?: string;
};

export function ProductPriceDisplay({
  price,
  locale,
  size = "card",
  muted = false,
  className,
}: ProductPriceDisplayProps) {
  const t = useTranslations("catalog");
  const nationalDay = isNationalDayCampaignActive();
  const currentClass =
    size === "pdp"
      ? "text-2xl font-semibold tabular-nums tracking-tight"
      : cn("text-price", muted && "text-xs font-normal text-text-secondary/75");

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {price.hasMarketingCompare && price.compareAtText && (
        <p className="text-sm tabular-nums text-text-secondary line-through">{price.compareAtText}</p>
      )}
      <p className={currentClass}>{price.text}</p>
      {price.isDemo && (
        <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] text-text-secondary">
          {t("demoPrice")}
        </span>
      )}
      {price.hasMarketingCompare && price.saveAmount != null && price.saveAmount > 0 && (
        <span className="rounded-md bg-brand-orange/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-orange">
          {locale === "ar"
            ? `وفر ${formatSave(price.saveAmount, locale)}`
            : `Save ${formatSave(price.saveAmount, locale)}`}
        </span>
      )}
      {price.hasMarketingCompare && nationalDay && (
        <span className="rounded-md bg-brand-orange px-1.5 py-0.5 text-[10px] font-medium text-white">
          {t("nationalDayOffer")}
        </span>
      )}
    </div>
  );
}

function formatSave(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
