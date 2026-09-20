import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ReviewsPageContent } from "@/components/reviews/reviews-page-content";
import { listApprovedPublicReviews } from "@/lib/reviews/review-repository";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ReviewsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ReviewsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/reviews",
    titleAr: "آراء عملائنا | اصول التميز",
    titleEn: "Customer Reviews | Osool Altamaioz",
    descriptionAr: "تجارب حقيقية من عملاء اختاروا حلول اصول التميز لمساحاتهم.",
    descriptionEn: "Real experiences from customers who chose Osool Altamaioz for their spaces.",
  });
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const localeKey = locale === "en" ? "en" : "ar";
  const reviews = await listApprovedPublicReviews(localeKey);

  return <ReviewsPageContent reviews={reviews} locale={localeKey} />;
}
