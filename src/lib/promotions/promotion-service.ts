import type { Promotion, PromotionFrequency, PromotionStatus, PromotionThemePreset } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/revalidation";
import {
  type PromotionThemeOverrides,
  type PromotionThemeStyles,
  resolvePromotionTheme,
} from "@/lib/promotions/promotion-themes";
import { prisma } from "@/lib/prisma";

export type PublicPromotion = {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string | null;
  subtitleEn: string | null;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  primaryCtaLabelAr: string;
  primaryCtaLabelEn: string;
  primaryCtaUrl: string;
  secondaryCtaLabelAr: string | null;
  secondaryCtaLabelEn: string | null;
  secondaryCtaUrl: string | null;
  discountPercentClaim: number | null;
  frequency: PromotionFrequency;
  desktopEnabled: boolean;
  mobileEnabled: boolean;
  themePreset: PromotionThemePreset;
  theme: PromotionThemeStyles;
};

function resolveRuntimeStatus(row: Promotion, now = new Date()): PromotionStatus {
  if (row.status === "DRAFT") return "DRAFT";
  if (row.endsAt && row.endsAt < now) return "EXPIRED";
  if (row.startsAt && row.startsAt > now) return "SCHEDULED";
  if (row.status === "ACTIVE" || row.status === "SCHEDULED") return "ACTIVE";
  return row.status;
}

function toPublic(row: Promotion): PublicPromotion {
  const overrides = (row.themeOverrides ?? null) as PromotionThemeOverrides | null;
  const theme = resolvePromotionTheme(row.themePreset, overrides);
  if (row.backgroundImageUrl) {
    theme.backgroundImageUrl = row.backgroundImageUrl;
  }

  return {
    id: row.id,
    titleAr: row.titleAr,
    titleEn: row.titleEn,
    subtitleAr: row.subtitleAr,
    subtitleEn: row.subtitleEn,
    imageUrl: row.imageUrl,
    imageUrlMobile: row.imageUrlMobile,
    primaryCtaLabelAr: row.primaryCtaLabelAr,
    primaryCtaLabelEn: row.primaryCtaLabelEn,
    primaryCtaUrl: row.primaryCtaUrl,
    secondaryCtaLabelAr: row.secondaryCtaLabelAr,
    secondaryCtaLabelEn: row.secondaryCtaLabelEn,
    secondaryCtaUrl: row.secondaryCtaUrl,
    discountPercentClaim: row.discountPercentClaim,
    frequency: row.frequency,
    desktopEnabled: row.desktopEnabled,
    mobileEnabled: row.mobileEnabled,
    themePreset: row.themePreset,
    theme,
  };
}

async function loadActivePopupPromotion(): Promise<PublicPromotion | null> {
  if (!process.env.DATABASE_URL?.trim()) return null;
  const now = new Date();
  const rows = await prisma.promotion.findMany({
    where: {
      popupEnabled: true,
      status: { in: ["ACTIVE", "SCHEDULED"] },
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    take: 5,
  });

  for (const row of rows) {
    if (resolveRuntimeStatus(row, now) === "ACTIVE") return toPublic(row);
  }
  return null;
}

export const getActiveStorePromotion = unstable_cache(
  loadActivePopupPromotion,
  ["active-store-promotion-v2"],
  { revalidate: 60, tags: [CACHE_TAGS.promotions] },
);

export async function syncPromotionStatuses() {
  const now = new Date();
  await prisma.promotion.updateMany({
    where: { endsAt: { lt: now }, status: { in: ["ACTIVE", "SCHEDULED"] } },
    data: { status: "EXPIRED" },
  });
}
