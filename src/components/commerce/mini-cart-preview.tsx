"use client";

import { ShoppingBag, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { CartAddedMeta } from "@/components/commerce/cart-feedback-provider";
import { useCart } from "@/components/commerce/cart-provider";
import { Link } from "@/i18n/navigation";
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder";
import { cn } from "@/lib/utils";

type MiniCartPreviewProps = {
  open: boolean;
  onClose: () => void;
  lastAdded: CartAddedMeta | null;
};

export function MiniCartPreview({ open, onClose, lastAdded }: MiniCartPreviewProps) {
  const t = useTranslations("cartFeedback");
  const tCart = useTranslations("commerce.cart");
  const locale = useLocale();
  const { lines, count, isHydrated } = useCart();

  const previewLines = lines.slice(0, 4);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[55] bg-black/20 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed z-[56] flex max-h-[min(32rem,calc(100vh-5.5rem))] w-[min(100vw-1.5rem,22rem)] flex-col overflow-hidden rounded-2xl border border-border/90 bg-white shadow-[0_20px_50px_rgba(8,8,8,0.14)] transition-all duration-200 ease-out",
          "end-3 top-[calc(var(--header-height)+0.5rem)] md:end-5 md:top-[calc(var(--header-height)+0.75rem)]",
          open ? "mini-cart-panel pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
        aria-label={t("miniCartTitle")}
        aria-hidden={!open}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-[18px] w-[18px] text-brand-orange" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="text-sm font-semibold">{t("miniCartTitle")}</h2>
            {isHydrated && count > 0 && (
              <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-[11px] font-medium text-brand-orange">
                {count}
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} className="icon-btn-premium h-9 w-9" aria-label={t("close")}>
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {!isHydrated ? (
            <p className="text-sm text-text-secondary">{t("loading")}</p>
          ) : lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingBag className="mb-2.5 h-9 w-9 text-text-secondary/35" strokeWidth={1.25} />
              <p className="text-sm text-text-secondary">{tCart("empty")}</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {lastAdded && open && (
                <li className="rounded-xl border border-brand-orange/25 bg-brand-orange/[0.04] px-3 py-2.5">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-brand-orange">
                    {t("justAdded")}
                  </p>
                  <MiniCartLine
                    locale={locale}
                    name={lastAdded.productName}
                    quantity={lastAdded.quantity}
                    imageUrl={lastAdded.imageUrl}
                    variantNote={lastAdded.variantNote}
                  />
                </li>
              )}
              {previewLines.map((line) => {
                if (lastAdded?.variantSku && line.variantSku === lastAdded.variantSku) {
                  return null;
                }
                return (
                  <li
                    key={line.variantSku}
                    className="rounded-xl border border-border/80 bg-surface-muted/40 px-3 py-2.5"
                  >
                    <MiniCartLine
                      locale={locale}
                      name={line.displayName ?? line.productSlug}
                      quantity={line.quantity}
                      imageUrl={line.imageUrl}
                      variantNote={line.variantNote}
                    />
                  </li>
                );
              })}
              {lines.length > 4 && (
                <li className="px-1 text-center text-xs text-text-secondary">
                  {t("moreItems", { count: lines.length - 4 })}
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="space-y-2 border-t border-border/80 p-4">
          <Link href="/cart" onClick={onClose} className="btn-cta h-10 w-full text-sm">
            {t("viewCart")}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="btn-cta-secondary h-10 w-full text-sm"
          >
            {t("continueShopping")}
          </button>
        </div>
      </aside>
    </>
  );
}

function MiniCartLine({
  locale,
  name,
  quantity,
  imageUrl,
  variantNote,
}: {
  locale: string;
  name: string;
  quantity: number;
  imageUrl?: string | null;
  variantNote?: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ProductImagePlaceholder locale={locale} className="h-full w-full" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-snug">{name}</p>
        {variantNote && (
          <p className="mt-0.5 text-xs text-text-secondary">{variantNote}</p>
        )}
      </div>
      <span className="shrink-0 text-sm font-medium tabular-nums text-text-secondary">×{quantity}</span>
    </div>
  );
}
