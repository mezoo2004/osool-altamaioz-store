"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ReviewCard } from "@/components/reviews/review-card";
import { WriteReviewForm } from "@/components/reviews/write-review-form";
import type { PublicCustomerReview } from "@/lib/reviews/types";

type ReviewsPageContentProps = {
  reviews: PublicCustomerReview[];
  locale: "ar" | "en";
};

export function ReviewsPageContent({ reviews: initial, locale }: ReviewsPageContentProps) {
  const t = useTranslations("reviews");
  const [sort, setSort] = useState<"newest" | "rating">("newest");

  const reviews = useMemo(() => {
    const list = [...initial];
    if (sort === "rating") {
      return list.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt));
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [initial, sort]);

  return (
    <div className="container-page py-8 pb-mobile-sticky-extra md:py-12">
      <header className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-orange">{t("eyebrow")}</p>
        <h1 className="heading-section mt-2">{t("pageTitle")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary md:text-base">{t("pageSubtitle")}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-12">
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-secondary">{t("count", { count: reviews.length })}</p>
            <label className="inline-flex items-center gap-2 text-sm">
              <span className="text-text-secondary">{t("sortLabel")}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "newest" | "rating")}
                className="h-10 rounded-lg border border-border bg-white px-3"
              >
                <option value="newest">{t("sortNewest")}</option>
                <option value="rating">{t("sortRating")}</option>
              </select>
            </label>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-border bg-[#faf9f7] px-6 py-14 text-center">
              <p className="font-medium text-brand-black-soft">{t("emptyTitle")}</p>
              <p className="mt-2 text-sm text-text-secondary">{t("emptyHint")}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} locale={locale} />
              ))}
            </div>
          )}
        </div>

        <WriteReviewForm className="lg:sticky lg:top-24" />
      </div>
    </div>
  );
}
