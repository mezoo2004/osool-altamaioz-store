import { ProductGridSkeleton } from "@/components/catalog/product-card";

export default function CategoryLoading() {
  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 h-10 w-48 animate-pulse rounded bg-surface-muted" />
      <ProductGridSkeleton count={12} />
    </div>
  );
}
