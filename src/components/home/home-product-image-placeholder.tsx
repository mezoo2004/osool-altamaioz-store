import { OsoolProductPlaceholder } from "@/components/ui/osool-product-placeholder";
import { getProductPlaceholderSilhouette } from "@/lib/catalog/product-placeholder";
import { cn } from "@/lib/utils";

type HomeProductImagePlaceholderProps = {
  className?: string;
  categorySlugs?: string[];
  productType?: string | null;
};

/** Premium editorial placeholder for missing product photography on the homepage only. */
export function HomeProductImagePlaceholder({
  className,
  categorySlugs = [],
  productType,
}: HomeProductImagePlaceholderProps) {
  const silhouette = getProductPlaceholderSilhouette(categorySlugs, productType);

  return (
    <OsoolProductPlaceholder className={cn("bg-[#ebe9e5]", className)} silhouette={silhouette} />
  );
}
