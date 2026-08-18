import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ScenesIndexContent } from "@/components/experience/scenes-index-content";
import { getSceneRepository, getSpaceRepository } from "@/lib/data";
import { buildExperienceMetadata } from "@/lib/seo/metadata";

type ScenesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ space?: string }>;
};

export async function generateMetadata({ params }: ScenesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildExperienceMetadata({
    locale,
    path: "/scenes",
    titleAr: "تسوق المشهد | اصول التميز",
    titleEn: "Shop The Scene | Osool Altamaioz",
    descriptionAr: "تسوق الإضاءة من مشاهد داخلية تفاعلية — اضغط على النقاط واطلع المنتجات.",
    descriptionEn: "Shop lighting from interactive interior scenes — tap hotspots and add products.",
  });
}

export default async function ScenesPage({ params, searchParams }: ScenesPageProps) {
  const { locale } = await params;
  const { space: spaceFilter } = await searchParams;
  setRequestLocale(locale);

  const [allScenes, spaces] = await Promise.all([
    getSceneRepository().list(),
    getSpaceRepository().list(),
  ]);

  let scenes = allScenes;
  if (spaceFilter) {
    const space = spaces.find((s) => s.slug === spaceFilter);
    if (space) {
      scenes = allScenes.filter((s) => s.spaceId === space.id);
    }
  }

  return (
    <ScenesIndexContent
      scenes={scenes}
      spaces={spaces}
      locale={locale}
      initialSpaceFilter={spaceFilter}
    />
  );
}
