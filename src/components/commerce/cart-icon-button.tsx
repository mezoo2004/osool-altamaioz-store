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
  const { openMiniCart, badgePulse, cartIconPulse } = useCartFeedback();

  return (
    <button
      type="button"
      onClick={openMiniCart}
      className={cn("icon-btn-premium relative", className)}
      aria-label={label}
    >
      {cartIconPulse && (
        <span
          className="cart-icon-ring pointer-events-none absolute inset-0 rounded-xl border border-brand-orange/40"
          aria-hidden="true"
        />
      )}
      <ShoppingBag
        className={cn("header-icon-svg", cartIconPulse && "cart-icon-bounce")}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {count > 0 && (
        <span
          className={cn(
            "absolute -end-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold leading-none text-white shadow-sm",
            badgePulse && "cart-badge-pulse",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
