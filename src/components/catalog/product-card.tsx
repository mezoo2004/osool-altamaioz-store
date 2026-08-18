"use client";

import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder";
import { HomeProductImagePlaceholder } from "@/components/home/home-product-image-placeholder";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useWishlist } from "@/components/commerce/wishlist-provider";
import { getPriceDisplay, getProductName } from "@/lib/catalog/display";
import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  locale: string;
  className?: string;
  highlightQuery?: string;
  presentation?: "default" | "home";
};

export function ProductCard({
  product,
  locale,
  className,
  highlightQuery,
  presentation = "default",
}: ProductCardProps) {
  const t = useTranslations("catalog");
  const { has, toggle } = useWishlist();
  const inWishlist = has(product.slug);
  const name = getProductName(product, locale);
  const price = getPriceDisplay(product, product.variants[0], locale);
  const outOfStock = product.stockStatus === "OUT_OF_STOCK";
  const isHome = presentation === "home";
  const priceMuted = isHome && !price.isConfirmed && !price.isDemo;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-white transition-colors hover:border-brand-gray/50",
        outOfStock && "opacity-75",
        isHome && "rounded-none border-0 bg-transparent shadow-none hover:border-0",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => toggle(product.slug)}
        className={cn(
          "absolute end-2.5 top-2.5 z-10 inline-flex items-center justify-center rounded-lg bg-white/90 transition-colors",
          isHome ? "end-3 top-3 h-10 w-10" : "h-8 w-8",
          inWishlist ? "text-brand-orange" : "text-text-secondary hover:text-brand-black-soft",
        )}
        aria-label={inWishlist ? t("removeFromWishlist") : t("addToWishlist")}
      >
        <HeartIcon filled={inWishlist} />
      </button>

      <Link href={`/products/${product.slug}`} className="block">
        <div
          className={cn(
            "relative aspect-square overflow-hidden bg-surface-muted",
            isHome && "aspect-[4/5] bg-[#f0efec]",
          )}
          {...(isHome ? { "data-home-image": true } : {})}
        >
          {product.variants[0]?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.variants[0].imageUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              className={cn(
                "h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]",
                outOfStock && "grayscale",
              )}
            />
          ) : isHome ? (
            <HomeProductImagePlaceholder className="h-full w-full" />
          ) : (
            <ProductImagePlaceholder locale={locale} />
          )}

          <div className="absolute start-2.5 top-2.5 flex flex-col gap-1">
            {product.isOnOffer && <Badge label={t("offer")} variant="accent" />}
            {product.isNew && !product.isOnOffer && <Badge label={t("new")} />}
            {product.isBestseller && !product.isOnOffer && !product.isNew && (
              <Badge label={t("bestseller")} />
            )}
            {outOfStock && <Badge label={t("outOfStock")} muted />}
          </div>
        </div>

        <div className={cn("space-y-1 p-3.5", isHome && "space-y-1.5 px-1 pt-4 pb-2")} {...(isHome ? { "data-home-body": true } : {})}>
          {product.series && (
            <p
              className={cn("text-[10px] font-medium uppercase tracking-[0.14em] text-text-secondary", isHome && "tracking-[0.18em]")}
              {...(isHome ? { "data-home-series": true } : {})}
            >
              {product.series}
            </p>
          )}
          <h3
            className={cn("line-clamp-2 font-medium leading-snug", isHome ? "text-base lg:text-lg" : "text-sm")}
            {...(isHome ? { "data-home-title": true } : {})}
          >
            {highlightQuery ? <Highlight text={name} query={highlightQuery} /> : name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <p
              className={cn(
                priceMuted ? "text-xs font-normal text-text-secondary/75" : "text-price",
                outOfStock && !priceMuted && "text-text-secondary",
              )}
              {...(priceMuted ? { "data-home-price-muted": true } : {})}
            >
              {price.text}
            </p>
            {price.isDemo && (
              <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] text-text-secondary">
                {t("demoPrice")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

function Badge({
  label,
  muted = false,
  variant,
}: {
  label: string;
  muted?: boolean;
  variant?: "accent";
}) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        muted
          ? "bg-brand-gray text-white"
          : variant === "accent"
            ? "bg-brand-orange text-white"
            : "bg-brand-black-soft text-white",
      )}
    >
      {label}
    </span>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (!q || idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand-orange/10 text-brand-orange">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden="true">
      <path
        d="M12 20s-7-4.35-7-9.5a4.5 4.5 0 0 1 8-2.74A4.5 4.5 0 0 1 19 10.5C19 15.65 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ProductGrid({
  products,
  locale,
  highlightQuery,
}: {
  products: Product[];
  locale: string;
  highlightQuery?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          highlightQuery={highlightQuery}
        />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card-surface overflow-hidden">
      <div className="aspect-square animate-pulse bg-surface-muted" />
      <div className="space-y-2 p-3.5">
        <div className="h-2.5 w-14 animate-pulse rounded bg-surface-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
