"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MiniCartPreview } from "@/components/commerce/mini-cart-preview";
import { CartToast } from "@/components/commerce/cart-toast";

export type CartAddedMeta = {
  productName: string;
  productSlug?: string;
  quantity: number;
};

type CartFeedbackContextValue = {
  showAddedFeedback: (meta: CartAddedMeta) => void;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  isMiniCartOpen: boolean;
  badgePulse: boolean;
};

const CartFeedbackContext = createContext<CartFeedbackContextValue | null>(null);

export function CartFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<CartAddedMeta | null>(null);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const clearToastTimer = useCallback(() => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
  }, []);

  const showAddedFeedback = useCallback(
    (meta: CartAddedMeta) => {
      clearToastTimer();
      setToast(meta);
      setBadgePulse(true);
      toastTimer.current = window.setTimeout(() => setToast(null), 4500);
    },
    [clearToastTimer],
  );

  useEffect(() => {
    if (!badgePulse) return;
    const t = window.setTimeout(() => setBadgePulse(false), 700);
    return () => window.clearTimeout(t);
  }, [badgePulse]);

  useEffect(() => () => clearToastTimer(), [clearToastTimer]);

  const value = useMemo(
    () => ({
      showAddedFeedback,
      openMiniCart: () => setIsMiniCartOpen(true),
      closeMiniCart: () => setIsMiniCartOpen(false),
      isMiniCartOpen,
      badgePulse,
    }),
    [showAddedFeedback, isMiniCartOpen, badgePulse],
  );

  return (
    <CartFeedbackContext.Provider value={value}>
      {children}
      <CartToast toast={toast} onDismiss={() => setToast(null)} onViewCart={() => setIsMiniCartOpen(true)} />
      <MiniCartPreview open={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
    </CartFeedbackContext.Provider>
  );
}

export function useCartFeedback() {
  const ctx = useContext(CartFeedbackContext);
  if (!ctx) throw new Error("useCartFeedback must be used within CartFeedbackProvider");
  return ctx;
}
