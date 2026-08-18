"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ProductGrid } from "@/components/catalog/product-card";
import type { Product } from "@/lib/catalog/types";

export function RecentlyViewedSection({
  locale,
  currentSlug,
}: {
  locale: string;
  currentSlug: string;
}) {
  const t = useTranslations("pdp");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const slugs = (JSON.parse(localStorage.getItem("osool-recent") ?? "[]") as string[]).filter(
      (s) => s !== currentSlug,
    );
    if (!slugs.length) return;

    fetch(`/api/products/batch?slugs=${encodeURIComponent(slugs.slice(0, 4).join(","))}`)
      .then((r) => r.json())
      .then((data: { products: Product[] }) => setProducts(data.products ?? []))
      .catch(() => undefined);
  }, [currentSlug]);

  if (!products.length) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-2xl font-semibold">{t("recentlyViewed")}</h2>
      <ProductGrid products={products} locale={locale} />
    </section>
  );
}
