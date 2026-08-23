"use client";

import { Heart, ExternalLink, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useWishlist } from "@/components/commerce/wishlist-provider";
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder";
import type { VisualMatchProduct } from "@/lib/visual-search/types";
import { cn } from "@/lib/utils";

type VisualSearchResultsListProps = {
  products: VisualMatchProduct[];
  locale: "ar" | "en";
  previewUrl?: string | null;
  analyzing?: boolean;
  onAskAi?: (slug: string) => void;
  compact?: boolean;
};

export function VisualSearchResultsList({
  products,
  locale,
  previewUrl,
  analyzing,
  onAskAi,
  compact,
}: VisualSearchResultsListProps) {
  const t = useTranslations("visualSearch");
  const tCatalog = useTranslations("catalog");

  if (analyzing) {
    return (
      <div className={cn("rounded-xl border border-border bg-white p-4", compact && "text-sm")}>
        {previewUrl && (
          <div className="mb-3 overflow-hidden rounded-lg border border-border bg-surface-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" className="max-h-28 w-full object-contain" />
          </div>
        )}
        <p className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          {t("analyzing")}
        </p>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-white shadow-soft", compact && "text-sm")}>
      {previewUrl && (
        <div className="border-b border-border bg-surface-muted p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" className="mx-auto max-h-24 object-contain" />
        </div>
      )}
      <ul className="divide-y divide-border">
        {products.map((p) => (
          <VisualResultRow key={p.slug} product={p} locale={locale} onAskAi={onAskAi} tCatalog={tCatalog} t={t} />
        ))}
      </ul>
    </div>
  );
}

function VisualResultRow({
  product,
  locale,
  onAskAi,
  tCatalog,
  t,
}: {
  product: VisualMatchProduct;
  locale: "ar" | "en";
  onAskAi?: (slug: string) => void;
  tCatalog: ReturnType<typeof useTranslations>;
  t: ReturnType<typeof useTranslations>;
}) {
  const { has, toggle } = useWishlist();
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const inWishlist = has(product.slug);

  return (
    <li className="flex gap-3 p-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ProductImagePlaceholder locale={locale} className="h-full w-full" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium">{name}</p>
        {product.sku && <p className="text-[10px] text-text-secondary">{product.sku}</p>}
        <p className="mt-0.5 text-[10px] text-meta">
          {locale === "ar" ? product.reasonAr : product.reasonEn}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[10px] font-medium hover:border-brand-orange/40"
          >
            <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
            {t("viewProduct")}
          </Link>
          {onAskAi && (
            <button
              type="button"
              onClick={() => onAskAi(product.slug)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[10px] font-medium hover:border-brand-orange/40"
            >
              <Sparkles className="h-3 w-3" strokeWidth={1.5} />
              {t("askAi")}
            </button>
          )}
          <button
            type="button"
            onClick={() => toggle(product.slug)}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[10px] font-medium hover:border-brand-orange/40"
            aria-label={inWishlist ? tCatalog("removeFromWishlist") : tCatalog("addToWishlist")}
          >
            <Heart className={cn("h-3 w-3", inWishlist && "fill-brand-orange text-brand-orange")} strokeWidth={1.5} />
            {t("wishlist")}
          </button>
        </div>
      </div>
    </li>
  );
}
