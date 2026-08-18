import { ProductCard } from "@/components/catalog/product-card";
import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function HomeProductGrid({ products, locale }: { products: Product[]; locale: string }) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-12 lg:gap-x-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          presentation="home"
          className={cn("home-product-card")}
        />
      ))}
    </div>
  );
}
