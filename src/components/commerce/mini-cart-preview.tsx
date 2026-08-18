"use client";

import { ShoppingBag, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/components/commerce/cart-provider";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type MiniCartPreviewProps = {
  open: boolean;
  onClose: () => void;
};

export function MiniCartPreview({ open, onClose }: MiniCartPreviewProps) {
  const t = useTranslations("cartFeedback");
  const tCart = useTranslations("commerce.cart");
  const locale = useLocale();
  const { lines, count, isHydrated } = useCart();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[55] bg-black/35 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed top-0 z-[56] flex h-full w-full max-w-sm flex-col border-s border-border bg-white shadow-2xl transition-transform duration-400 ease-out",
          "end-0",
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
        )}
        aria-label={t("miniCartTitle")}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-brand-orange" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="text-base font-semibold">{t("miniCartTitle")}</h2>
            {isHydrated && count > 0 && (
              <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-xs font-medium text-brand-orange">
                {count}
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} className="icon-btn-premium" aria-label={t("close")}>
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!isHydrated ? (
            <p className="text-sm text-text-secondary">{t("loading")}</p>
          ) : lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="mb-3 h-10 w-10 text-text-secondary/40" strokeWidth={1.25} />
              <p className="text-sm text-text-secondary">{tCart("empty")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {lines.map((line) => (
                <li
                  key={line.variantSku}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface-muted/50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{line.productSlug}</p>
                    <p className="text-xs text-text-secondary">{line.variantSku}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">×{line.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-5">
          <Link
            href="/cart"
            onClick={onClose}
            className="btn-cta w-full"
          >
            {locale === "ar" ? "عرض السلة الكاملة" : "View full cart"}
          </Link>
        </div>
      </aside>
    </>
  );
}
