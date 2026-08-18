import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { SpaceDetailContent } from "@/components/experience/space-detail-content";
import { getSceneRepository, getSpaceRepository } from "@/lib/data";
import { resolveProductsBySlugs } from "@/lib/experience/product-resolver";
import { buildExperienceMetadata } from "@/lib/seo/metadata";

type SpaceDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getSpaceRepository().getAllSlugs();
  return ["ar", "en"].flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: SpaceDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const space = await getSpaceRepository().getBySlug(slug);
  if (!space) return {};

  return buildExperienceMetadata({
    locale,
    path: `/spaces/${slug}`,
    titleAr: space.seoTitleAr,
    titleEn: space.seoTitleEn,
    descriptionAr: space.seoDescriptionAr,
    descriptionEn: space.seoDescriptionEn,
  });
}

export default async function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const spaceRepo = getSpaceRepository();
  const space = await spaceRepo.getBySlug(slug);
  if (!space) notFound();

  const [products, scenes, allSpaces] = await Promise.all([
    resolveProductsBySlugs(space.recommendedProductSlugs),
    getSceneRepository().getBySpaceId(space.id),
    spaceRepo.list(),
  ]);

  const relatedSpaces = allSpaces
    .filter((s) => s.slug !== space.slug)
    .slice(0, 4);

  return (
    <SpaceDetailContent
      space={space}
      relatedSpaces={relatedSpaces}
      products={products}
      scenes={scenes}
      locale={locale}
    />
  );
}
