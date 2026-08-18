"use client";

import { ShoppingBag } from "lucide-react";
import { useCartFeedback } from "@/components/commerce/cart-feedback-provider";
import { cn } from "@/lib/utils";

type CartIconButtonProps = {
  label: string;
  count: number;
  className?: string;
};

export function CartIconButton({ label, count, className }: CartIconButtonProps) {
  const { openMiniCart, badgePulse } = useCartFeedback();

  return (
    <button
      type="button"
      onClick={openMiniCart}
      className={cn("icon-btn-premium relative", className)}
      aria-label={label}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
      {count > 0 && (
        <span
          className={cn(
            "absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold leading-none text-white",
            badgePulse && "cart-badge-pulse",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
