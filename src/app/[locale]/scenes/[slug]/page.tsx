import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { SceneDetailContent } from "@/components/experience/scene-detail-content";
import { getSceneRepository, getSpaceRepository } from "@/lib/data";
import { pickVariant, resolveProductBySlug } from "@/lib/experience/product-resolver";
import { buildExperienceMetadata } from "@/lib/seo/metadata";

type SceneDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getSceneRepository().getAllSlugs();
  return ["ar", "en"].flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: SceneDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const scene = await getSceneRepository().getBySlug(slug);
  if (!scene) return {};

  return buildExperienceMetadata({
    locale,
    path: `/scenes/${slug}`,
    titleAr: scene.seoTitleAr,
    titleEn: scene.seoTitleEn,
    descriptionAr: scene.seoDescriptionAr,
    descriptionEn: scene.seoDescriptionEn,
  });
}

export default async function SceneDetailPage({ params }: SceneDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const scene = await getSceneRepository().getBySlug(slug);
  if (!scene) notFound();

  const space = scene.spaceId
    ? await getSpaceRepository().list().then((spaces) => spaces.find((s) => s.id === scene.spaceId) ?? null)
    : null;

  const hotspotProducts = (
    await Promise.all(
      scene.hotspots.map(async (hotspot) => {
        const product = await resolveProductBySlug(hotspot.productSlug);
        if (!product) return null;
        const variant = pickVariant(product, { variantId: hotspot.variantId });
        if (!variant) return null;
        return { hotspot, product, variant };
      }),
    )
  ).filter((h): h is NonNullable<typeof h> => Boolean(h));

  return (
    <SceneDetailContent
      scene={scene}
      space={space}
      hotspotProducts={hotspotProducts}
      locale={locale}
    />
  );
}
