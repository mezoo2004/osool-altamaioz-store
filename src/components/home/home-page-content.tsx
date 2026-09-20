import { getProductRepository } from "@/lib/data";
import { resolveHeroVideoPublicSrc } from "@/lib/home/hero-video-source";
import { HeroSection } from "@/components/home/hero-section";
import {
  CategoriesSection,
  LightingEditSection,
  ShopBySpaceSection,
  ShopTheSceneSection,
} from "@/components/home/home-sections";
import { PaymentTrustSection } from "@/components/home/payment-trust-section";
import { CustomerReviewsSection } from "@/components/reviews/customer-reviews-section";

type HomePageContentProps = {
  locale: string;
};

export async function HomePageContent({ locale }: HomePageContentProps) {
  const heroVideoSrc = resolveHeroVideoPublicSrc();
  const featuredResult = await getProductRepository().list({
    sort: "featured",
    page: 1,
    pageSize: 4,
  });

  return (
    <>
      <HeroSection heroVideoSrc={heroVideoSrc} />
      <ShopBySpaceSection />
      <CategoriesSection />
      <LightingEditSection products={featuredResult.items} locale={locale} />
      <CustomerReviewsSection locale={locale} />
      <PaymentTrustSection />
      <ShopTheSceneSection />
    </>
  );
}
