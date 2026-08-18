"use client";

import { useCallback, useEffect, useState } from "react";
import type { ValidatedCart } from "@/lib/commerce/types";
import type { CartLineStored } from "@/components/commerce/cart-provider";

export function useValidatedCart(lines: CartLineStored[], enabled = true) {
  const [cart, setCart] = useState<ValidatedCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || lines.length === 0) {
      setCart(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      if (!res.ok) throw new Error("validate_failed");
      setCart((await res.json()) as ValidatedCart);
    } catch {
      setError("validate_failed");
    } finally {
      setLoading(false);
    }
  }, [lines, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { cart, loading, error, refresh };
}
