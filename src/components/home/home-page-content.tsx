import { getProductRepository } from "@/lib/data";
import { HeroSection } from "@/components/home/hero-section";
import {
  CategoriesSection,
  LightingEditSection,
  LightingExperienceSection,
  ShopBySpaceSection,
  ShopTheSceneSection,
} from "@/components/home/home-sections";

type HomePageContentProps = {
  locale: string;
};

export async function HomePageContent({ locale }: HomePageContentProps) {
  const featuredResult = await getProductRepository().list({
    sort: "featured",
    page: 1,
    pageSize: 4,
  });

  return (
    <>
      <HeroSection />
      <ShopBySpaceSection />
      <CategoriesSection />
      <LightingEditSection products={featuredResult.items} locale={locale} />
      <ShopTheSceneSection />
      <LightingExperienceSection />
    </>
  );
}
