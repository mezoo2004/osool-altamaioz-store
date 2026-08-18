"use client";

import { Check, ShoppingBag, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CartAddedMeta } from "@/components/commerce/cart-feedback-provider";
import { cn } from "@/lib/utils";

type CartToastProps = {
  toast: CartAddedMeta | null;
  onDismiss: () => void;
  onViewCart: () => void;
};

export function CartToast({ toast, onDismiss, onViewCart }: CartToastProps) {
  const t = useTranslations("cartFeedback");

  return (
    <div
      className={cn(
        "pointer-events-none fixed start-4 end-4 top-[calc(var(--header-height)+0.75rem)] z-[60] mx-auto max-w-md transition-all duration-500 md:start-auto md:end-6 md:top-24",
        toast ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {toast && (
        <div className="cart-toast pointer-events-auto flex items-start gap-3 rounded-xl border border-border/80 bg-white p-4 shadow-soft">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
            <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-brand-black-soft">{t("addedTitle")}</p>
            <p className="mt-0.5 truncate text-xs text-text-secondary">{toast.productName}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  onViewCart();
                  onDismiss();
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-orange px-3 text-xs font-medium text-white transition-colors hover:bg-brand-orange/90"
              >
                <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                {t("viewCart")}
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium text-brand-black-soft transition-colors hover:border-brand-black-soft/25"
              >
                {t("continueShopping")}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="icon-btn-premium -me-1 -mt-1 h-8 w-8 shrink-0"
            aria-label={t("dismiss")}
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
