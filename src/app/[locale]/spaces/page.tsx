import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SpacesIndexContent } from "@/components/experience/spaces-index-content";
import { getSpaceRepository } from "@/lib/data";
import { buildExperienceMetadata } from "@/lib/seo/metadata";

type SpacesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: SpacesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildExperienceMetadata({
    locale,
    path: "/spaces",
    titleAr: "تسوق حسب المساحة | اصول التميز",
    titleEn: "Shop By Space | Osool Altamaioz",
    descriptionAr: "اختر مساحتك — مجلس، صالة، مطبخ، حديقة — واكتشف الإضاءة المناسبة.",
    descriptionEn: "Choose your space — majlis, living room, kitchen, garden — and discover suited lighting.",
  });
}

export default async function SpacesPage({ params }: SpacesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const spaces = await getSpaceRepository().list();

  return <SpacesIndexContent spaces={spaces} locale={locale} />;
}
