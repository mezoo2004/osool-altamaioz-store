"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder";
import type { PublicCustomerReview } from "@/lib/reviews/types";
import { StarRating } from "@/components/reviews/star-rating";
import { cn } from "@/lib/utils";

type ReviewCardProps = {
  review: PublicCustomerReview;
  locale: "ar" | "en";
  className?: string;
};

export function ReviewCard({ review, locale, className }: ReviewCardProps) {
  const [lightbox, setLightbox] = useState(false);
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    dateStyle: "medium",
  }).format(new Date(review.createdAt));

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border bg-white p-5 shadow-[0_8px_30px_rgba(8,8,8,0.04)] md:p-6",
        className,
      )}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-brand-black-soft">{review.displayName}</p>
          <p className="text-xs text-text-secondary">{date}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {review.isDemoSeed && (
            <span className="rounded-md bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-text-secondary">
              {locale === "ar" ? "نموذج عرض" : "Display sample"}
            </span>
          )}
          {review.verifiedPurchase && (
            <span className="rounded-md bg-brand-orange/10 px-2 py-0.5 text-[10px] font-semibold text-brand-orange">
              {locale === "ar" ? "شراء موثق" : "Verified purchase"}
            </span>
          )}
        </div>
      </div>

      <StarRating value={review.rating} readOnly size="sm" label={`${review.rating}/5`} />

      <p className="mt-4 flex-1 text-sm leading-relaxed text-text-primary">{review.body}</p>

      {review.imageUrl && (
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="mt-4 block overflow-hidden rounded-xl border border-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={review.imageUrl} alt="" className="h-28 w-full object-cover md:h-32" />
        </button>
      )}

      {review.productSlug && review.productName && (
        <Link
          href={`/products/${review.productSlug}`}
          className="mt-4 flex items-center gap-3 rounded-xl border border-border/80 bg-[#faf9f7] p-3 transition-colors hover:border-brand-orange/30"
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
            {review.productImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={review.productImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ProductImagePlaceholder locale={locale} className="h-full w-full" />
            )}
          </div>
          <span className="text-sm font-medium text-brand-black-soft">{review.productName}</span>
        </Link>
      )}

      {lightbox && review.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          onClick={() => setLightbox(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.imageUrl}
            alt=""
            className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
