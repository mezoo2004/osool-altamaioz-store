import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomePageContent } from "@/components/home/home-page-content";
import { isNationalDayCampaignActive } from "@/lib/campaigns/saudi-national-day";
import { NATIONAL_DAY_HERO_SRC } from "@/lib/campaigns/national-day-hero-asset";
import { buildPageMetadata } from "@/lib/seo/metadata";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return buildPageMetadata({
    locale,
    path: "/",
    titleAr: "اصول التميز | متجر إضاءة معمارية",
    titleEn: t("title"),
    descriptionAr: "اصول التميز — حلول إضاءة معمارية وزخرفية للمنازل والمشاريع في السعودية.",
    descriptionEn: t("description"),
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const nationalDayHeroActive = isNationalDayCampaignActive();

  return (
    <>
      {nationalDayHeroActive ? (
        <link rel="preload" as="image" href={NATIONAL_DAY_HERO_SRC} fetchPriority="high" />
      ) : null}
      <HomePageContent locale={locale} />
    </>
  );
}
