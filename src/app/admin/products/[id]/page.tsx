import { notFound } from "next/navigation";
import { AdminProductEditor } from "@/components/admin/admin-product-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

type AdminProductEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const user = await requireAdminSession();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: [{ isDefault: "desc" }, { sku: "asc" }] },
      images: { orderBy: { sortOrder: "asc" } },
      categoryLinks: { include: { category: true } },
    },
  });
  if (!product) notFound();

  const variant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const attrs = (variant?.attributes ?? {}) as Record<string, unknown>;
  const compareAt =
    typeof attrs.compareAtPrice === "number" ? attrs.compareAtPrice : null;

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
    select: { slug: true, nameAr: true },
  });

  return (
    <AdminShell user={user}>
      <AdminProductEditor
        categories={categories}
        product={{
          id: product.id,
          slug: product.slug,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          descriptionAr: product.descriptionAr,
          descriptionEn: product.descriptionEn,
          status: product.status,
          primaryCategorySlug:
            product.categoryLinks.find((l) => l.isPrimary)?.category.slug ??
            product.categoryLinks[0]?.category.slug ??
            null,
          imageUrl: product.images[0]?.url ?? variant?.imageUrl ?? null,
          defaultSku: variant?.sku ?? "—",
          sellingPrice: variant?.price?.toNumber() ?? null,
          compareAtPrice: compareAt,
        }}
      />
    </AdminShell>
  );
}
