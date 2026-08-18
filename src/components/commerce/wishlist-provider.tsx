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

const STORAGE_KEY = "osool-wishlist-v1";

type WishlistContextValue = {
  productIds: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  remove: (productId: string) => void;
  isHydrated: boolean;
  storage: "client" | "database";
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(slugs: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [storage, setStorage] = useState<"client" | "database">("client");
  const syncedRef = useRef(false);

  const persistLocal = useCallback((next: string[]) => {
    setProductIds(next);
    writeStorage(next);
  }, []);

  useEffect(() => {
    async function hydrate() {
      const guestSlugs = readStorage();

      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const me = (await meRes.json()) as { user?: { id: string } | null };
          if (me.user) {
            if (guestSlugs.length > 0) {
              const mergeRes = await fetch("/api/wishlist/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slugs: guestSlugs }),
              });
              if (mergeRes.ok) {
                const merged = (await mergeRes.json()) as { slugs: string[] };
                setProductIds(merged.slugs);
                writeStorage([]);
                setStorage("database");
                syncedRef.current = true;
                setIsHydrated(true);
                return;
              }
            }

            const wlRes = await fetch("/api/wishlist");
            if (wlRes.ok) {
              const data = (await wlRes.json()) as { slugs: string[]; storage?: string };
              setProductIds(data.slugs);
              setStorage(data.storage === "database" ? "database" : "client");
              syncedRef.current = true;
              setIsHydrated(true);
              return;
            }
          }
        }
      } catch {
        // Guest/offline — fall back to local storage
      }

      persistLocal(guestSlugs);
      setStorage("client");
      setIsHydrated(true);
    }

    hydrate();
  }, [persistLocal]);

  const syncToggle = useCallback(
    async (productId: string, nextLocal: string[]) => {
      if (storage !== "database") return;
      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: productId, action: "toggle" }),
        });
        if (res.ok) {
          const data = (await res.json()) as { slugs: string[] };
          setProductIds(data.slugs);
          return;
        }
      } catch {
        // Keep optimistic local state if API fails while offline
      }
      setProductIds(nextLocal);
    },
    [storage],
  );

  const toggle = useCallback(
    (productId: string) => {
      const current = readStorage().length ? readStorage() : productIds;
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];

      if (storage === "database") {
        setProductIds(next);
        void syncToggle(productId, next);
        return;
      }

      persistLocal(next);
    },
    [persistLocal, productIds, storage, syncToggle],
  );

  const remove = useCallback(
    (productId: string) => {
      const next = (storage === "database" ? productIds : readStorage()).filter(
        (id) => id !== productId,
      );

      if (storage === "database") {
        setProductIds(next);
        void fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: productId, action: "remove" }),
        })
          .then(async (res) => {
            if (res.ok) {
              const data = (await res.json()) as { slugs: string[] };
              setProductIds(data.slugs);
            }
          })
          .catch(() => undefined);
        return;
      }

      persistLocal(next);
    },
    [persistLocal, productIds, storage],
  );

  const has = useCallback((productId: string) => productIds.includes(productId), [productIds]);

  const value = useMemo(
    () => ({ productIds, toggle, has, remove, isHydrated, storage }),
    [productIds, toggle, has, remove, isHydrated, storage],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
