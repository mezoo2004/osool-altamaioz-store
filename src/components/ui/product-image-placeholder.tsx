import { OsoolProductPlaceholder } from "@/components/ui/osool-product-placeholder";
import { getProductPlaceholderSilhouette } from "@/lib/catalog/product-placeholder";
import { cn } from "@/lib/utils";

type ProductImagePlaceholderProps = {
  locale: string;
  className?: string;
  label?: string;
  categorySlugs?: string[];
  productType?: string | null;
};

export function ProductImagePlaceholder({
  locale,
  className,
  label,
  categorySlugs = [],
  productType,
}: ProductImagePlaceholderProps) {
  const text = label ?? (locale === "ar" ? "صورة قريباً" : "Image coming soon");
  const silhouette = getProductPlaceholderSilhouette(categorySlugs, productType);

  return (
    <div className={cn("relative h-full w-full", className)} role="img" aria-label={text}>
      <OsoolProductPlaceholder silhouette={silhouette} compact />
    </div>
  );
}
