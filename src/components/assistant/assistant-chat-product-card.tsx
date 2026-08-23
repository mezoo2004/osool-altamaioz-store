"use client";

import { Heart, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useWishlist } from "@/components/commerce/wishlist-provider";
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder";
import type { AssistantProductCard } from "@/lib/assistant/assistant-types";
import { cn } from "@/lib/utils";

type AssistantChatProductCardProps = {
  card: AssistantProductCard;
  locale: "ar" | "en";
  compact?: boolean;
  showVisualActions?: boolean;
  onSimilar?: () => void;
};

function displayName(card: AssistantProductCard, locale: "ar" | "en") {
  return locale === "ar" ? card.nameAr : card.nameEn;
}

export function AssistantChatProductCard({
  card,
  locale,
  compact,
  showVisualActions,
  onSimilar,
}: AssistantChatProductCardProps) {
  const tCatalog = useTranslations("catalog");
  const tVisual = useTranslations("visualSearch");
  const { has, toggle } = useWishlist();
  const inWishlist = has(card.slug);
  const name = displayName(card, locale);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border border-border/80 bg-white",
        compact ? "text-[11px]" : "text-xs",
      )}
    >
      <div className="flex gap-2.5 p-2.5">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
          {card.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ProductImagePlaceholder locale={locale} className="h-full w-full" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-medium leading-snug text-brand-black-soft">{name}</p>
          {card.sku && <p className="mt-0.5 text-[10px] text-text-secondary">{card.sku}</p>}
          {card.keySpec && <p className="mt-0.5 text-[10px] text-meta">{card.keySpec}</p>}
          {card.quantity && card.layer && (
            <p className="mt-0.5 text-[10px] text-brand-orange">
              ×{card.quantity} · {card.layer}
            </p>
          )}
          {card.priceAvailable && card.priceText ? (
            <p className="mt-1 font-medium tabular-nums">{card.priceText}</p>
          ) : (
            <p className="mt-1 text-[10px] text-meta">
              {locale === "ar" ? "السعر غير متاح حالياً" : "Price unavailable"}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap border-t border-border/60">
        <Link
          href={card.productUrl}
          className="flex min-w-[50%] flex-1 items-center justify-center gap-1 py-2 text-[10px] font-medium text-brand-black-soft transition-colors hover:bg-surface-muted"
        >
          <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
          {tVisual("viewProduct")}
        </Link>
        {showVisualActions && onSimilar && (
          <button
            type="button"
            onClick={onSimilar}
            className="flex min-w-[50%] flex-1 items-center justify-center gap-1 border-s border-border/60 py-2 text-[10px] font-medium text-brand-black-soft transition-colors hover:bg-surface-muted"
          >
            {tVisual("similarOption")}
          </button>
        )}
        {card.sceneUrl && (
          <Link
            href={card.sceneUrl}
            className="flex min-w-[50%] flex-1 items-center justify-center gap-1 border-s border-border/60 py-2 text-[10px] font-medium text-brand-orange transition-colors hover:bg-brand-orange/5"
          >
            {tVisual("tryInScene")}
          </Link>
        )}
        <button
          type="button"
          onClick={() => toggle(card.slug)}
          className="flex min-w-[2.5rem] items-center justify-center border-s border-border/60 px-3 py-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-brand-orange"
          aria-label={inWishlist ? tCatalog("removeFromWishlist") : tCatalog("addToWishlist")}
        >
          <Heart
            className={cn("h-3.5 w-3.5", inWishlist && "fill-brand-orange text-brand-orange")}
            strokeWidth={1.5}
          />
        </button>
      </div>
    </article>
  );
}
