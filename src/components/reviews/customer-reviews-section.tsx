import { HomeArrowLink, HomeSectionHeader } from "@/components/home/home-ui";
import { ReviewCard } from "@/components/reviews/review-card";
import { listApprovedPublicReviews } from "@/lib/reviews/review-repository";
import { getTranslations } from "next-intl/server";

type CustomerReviewsSectionProps = {
  locale: string;
};

export async function CustomerReviewsSection({ locale }: CustomerReviewsSectionProps) {
  const t = await getTranslations("reviews");
  const localeKey = locale === "en" ? "en" : "ar";
  const reviews = await listApprovedPublicReviews(localeKey, 4);

  return (
    <section className="home-section-y bg-white home-reveal">
      <div className="container-home">
        <HomeSectionHeader
          title={t("homeTitle")}
          subtitle={t("homeSubtitle")}
          action={<HomeArrowLink href="/reviews">{t("viewAll")}</HomeArrowLink>}
        />

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-border bg-[#faf9f7] px-6 py-12 text-center">
            <p className="text-sm font-medium text-brand-black-soft">{t("emptyTitle")}</p>
            <p className="mt-2 text-sm text-text-secondary">{t("emptyHint")}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} locale={localeKey} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
