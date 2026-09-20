export type PromoCampaign = {
  id: string;
  enabled: boolean;
  eyebrowAr: string;
  eyebrowEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  ctaAr: string;
  ctaEn: string;
  href: string;
  image?: string;
  badge?: string;
  startDate?: string;
  endDate?: string;
};

/** Safe demo campaign — no invented prices or discount percentages. */
export const demoPromoCampaign: PromoCampaign = {
  id: "demo-selected-offers",
  enabled: true,
  eyebrowAr: "عروض مختارة",
  eyebrowEn: "Selected offers",
  titleAr: "اكتشف عروض اصول التميز",
  titleEn: "Discover Osool Altamaioz offers",
  descriptionAr: "تشكيلات مختارة من الإضاءة المعمارية — استكشف ما يناسب مساحتك.",
  descriptionEn: "Curated architectural lighting — explore what fits your space.",
  ctaAr: "استكشف العروض",
  ctaEn: "Explore offers",
  href: "/offers",
  badge: "Osool Altamaioz",
};

export function isPromoCampaignActive(campaign: PromoCampaign, now = new Date()): boolean {
  if (!campaign.enabled) return false;
  if (campaign.startDate) {
    const start = new Date(campaign.startDate);
    if (!Number.isNaN(start.getTime()) && now < start) return false;
  }
  if (campaign.endDate) {
    const end = new Date(campaign.endDate);
    if (!Number.isNaN(end.getTime()) && now > end) return false;
  }
  return true;
}

export function getActiveHomePromoCampaigns(now = new Date()): PromoCampaign[] {
  return [demoPromoCampaign].filter((c) => isPromoCampaignActive(c, now));
}
