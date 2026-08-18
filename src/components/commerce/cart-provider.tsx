"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLineInput } from "@/lib/commerce/types";

const STORAGE_KEY = "osool-cart-v1";

export type CartLineStored = CartLineInput;

type CartContextValue = {
  lines: CartLineStored[];
  count: number;
  isHydrated: boolean;
  addLine: (line: CartLineStored) => void;
  updateQuantity: (variantSku: string, quantity: number) => void;
  removeLine: (variantSku: string) => void;
  clearCart: () => void;
  mergeLines: (incoming: CartLineStored[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLineStored[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLineStored[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(lines: CartLineStored[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLineStored[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setLines(readStorage());
    setIsHydrated(true);
  }, []);

  const persist = useCallback((next: CartLineStored[]) => {
    setLines(next);
    writeStorage(next);
  }, []);

  const addLine = useCallback(
    (line: CartLineStored) => {
      const prev = readStorage();
      const idx = prev.findIndex((l) => l.variantSku === line.variantSku);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + line.quantity };
        persist(next);
        return;
      }
      persist([...prev, line]);
    },
    [persist],
  );

  const updateQuantity = useCallback(
    (variantSku: string, quantity: number) => {
      if (quantity <= 0) {
        persist(readStorage().filter((l) => l.variantSku !== variantSku));
        return;
      }
      persist(
        readStorage().map((l) => (l.variantSku === variantSku ? { ...l, quantity } : l)),
      );
    },
    [persist],
  );

  const removeLine = useCallback(
    (variantSku: string) => {
      persist(readStorage().filter((l) => l.variantSku !== variantSku));
    },
    [persist],
  );

  const clearCart = useCallback(() => persist([]), [persist]);

  const mergeLines = useCallback(
    (incoming: CartLineStored[]) => {
      const map = new Map(readStorage().map((l) => [l.variantSku, l]));
      for (const line of incoming) {
        const existing = map.get(line.variantSku);
        if (existing) {
          map.set(line.variantSku, {
            ...existing,
            quantity: existing.quantity + line.quantity,
          });
        } else {
          map.set(line.variantSku, line);
        }
      }
      persist([...map.values()]);
    },
    [persist],
  );

  const count = useMemo(() => lines.reduce((n, l) => n + l.quantity, 0), [lines]);

  const value = useMemo(
    () => ({
      lines,
      count,
      isHydrated,
      addLine,
      updateQuantity,
      removeLine,
      clearCart,
      mergeLines,
    }),
    [lines, count, isHydrated, addLine, updateQuantity, removeLine, clearCart, mergeLines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
