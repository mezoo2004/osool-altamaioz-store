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
  variantSku?: string;
  quantity: number;
  imageUrl?: string | null;
  variantNote?: string | null;
};

type CartFeedbackContextValue = {
  showAddedFeedback: (meta: CartAddedMeta) => void;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  isMiniCartOpen: boolean;
  badgePulse: boolean;
  cartIconPulse: boolean;
  lastAdded: CartAddedMeta | null;
};

const CartFeedbackContext = createContext<CartFeedbackContextValue | null>(null);

export function CartFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<CartAddedMeta | null>(null);
  const [lastAdded, setLastAdded] = useState<CartAddedMeta | null>(null);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);
  const [cartIconPulse, setCartIconPulse] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const miniCartTimer = useRef<number | null>(null);

  const clearToastTimer = useCallback(() => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
  }, []);

  const clearMiniCartTimer = useCallback(() => {
    if (miniCartTimer.current) {
      window.clearTimeout(miniCartTimer.current);
      miniCartTimer.current = null;
    }
  }, []);

  const showAddedFeedback = useCallback(
    (meta: CartAddedMeta) => {
      clearToastTimer();
      clearMiniCartTimer();
      setLastAdded(meta);
      setToast(meta);
      setBadgePulse(true);
      setCartIconPulse(true);
      toastTimer.current = window.setTimeout(() => setToast(null), 4500);
      miniCartTimer.current = window.setTimeout(() => setIsMiniCartOpen(true), 280);
    },
    [clearToastTimer, clearMiniCartTimer],
  );

  useEffect(() => {
    if (!badgePulse) return;
    const t = window.setTimeout(() => setBadgePulse(false), 700);
    return () => window.clearTimeout(t);
  }, [badgePulse]);

  useEffect(() => {
    if (!cartIconPulse) return;
    const t = window.setTimeout(() => setCartIconPulse(false), 700);
    return () => window.clearTimeout(t);
  }, [cartIconPulse]);

  useEffect(
    () => () => {
      clearToastTimer();
      clearMiniCartTimer();
    },
    [clearToastTimer, clearMiniCartTimer],
  );

  const value = useMemo(
    () => ({
      showAddedFeedback,
      openMiniCart: () => setIsMiniCartOpen(true),
      closeMiniCart: () => setIsMiniCartOpen(false),
      isMiniCartOpen,
      badgePulse,
      cartIconPulse,
      lastAdded,
    }),
    [showAddedFeedback, isMiniCartOpen, badgePulse, cartIconPulse, lastAdded],
  );

  return (
    <CartFeedbackContext.Provider value={value}>
      {children}
      <CartToast
        toast={toast}
        onDismiss={() => setToast(null)}
        onViewCart={() => {
          setIsMiniCartOpen(true);
          setToast(null);
        }}
      />
      <MiniCartPreview
        open={isMiniCartOpen}
        onClose={() => setIsMiniCartOpen(false)}
        lastAdded={lastAdded}
      />
    </CartFeedbackContext.Provider>
  );
}

export function useCartFeedback() {
  const ctx = useContext(CartFeedbackContext);
  if (!ctx) throw new Error("useCartFeedback must be used within CartFeedbackProvider");
  return ctx;
}
