import type { Prisma } from "@prisma/client";
import { revalidateCatalogProduct } from "@/lib/cache/revalidation";
import { prisma } from "@/lib/prisma";

export async function searchAdminProducts(input: {
  q?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, input.pageSize ?? 20));
  const where: Prisma.ProductWhereInput = {};
  if (input.categorySlug) {
    where.categoryLinks = { some: { category: { slug: input.categorySlug } } };
  }
  if (input.q?.trim()) {
    const q = input.q.trim();
    where.OR = [
      { nameAr: { contains: q } },
      { nameEn: { contains: q } },
      { slug: { contains: q } },
      { sku: { contains: q } },
      { variants: { some: { sku: { contains: q } } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        variants: { orderBy: { sku: "asc" } },
        categoryLinks: { include: { category: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, page, pageSize, items };
}

export async function updateAdminProduct(input: {
  productId: string;
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  primaryCategorySlug?: string;
  sellingPrice?: number | null;
  compareAtPrice?: number | null;
  priceConfirmed?: boolean;
}) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    include: { variants: { orderBy: { isDefault: "desc" } } },
  });
  if (!product) throw new Error("not_found");

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  if (!defaultVariant) throw new Error("no_variant");

  const attrs = (defaultVariant.attributes ?? {}) as Record<string, unknown>;
  if (input.compareAtPrice === null) {
    delete attrs.compareAtPrice;
  } else if (typeof input.compareAtPrice === "number") {
    attrs.compareAtPrice = input.compareAtPrice;
  }

  await prisma.$transaction([
    prisma.product.update({
      where: { id: product.id },
      data: {
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        descriptionAr: input.descriptionAr,
        descriptionEn: input.descriptionEn,
        status: input.status,
        basePrice: input.sellingPrice ?? undefined,
        priceConfirmed: input.priceConfirmed ?? undefined,
      },
    }),
    prisma.productVariant.update({
      where: { id: defaultVariant.id },
      data: {
        price: input.sellingPrice ?? undefined,
        priceConfirmed:
          input.priceConfirmed ?? (input.sellingPrice != null ? true : defaultVariant.priceConfirmed),
        attributes: attrs as Prisma.InputJsonValue,
      },
    }),
  ]);

  if (input.primaryCategorySlug) {
    const cat = await prisma.category.findUnique({ where: { slug: input.primaryCategorySlug } });
    if (cat) {
      await prisma.productCategory.deleteMany({ where: { productId: product.id, isPrimary: true } });
      await prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: product.id, categoryId: cat.id } },
        create: { productId: product.id, categoryId: cat.id, isPrimary: true },
        update: { isPrimary: true },
      });
      await prisma.product.update({ where: { id: product.id }, data: { categoryId: cat.id } });
    }
  }

  revalidateCatalogProduct(product.slug);
  return product.slug;
}

export async function replaceProductMainImage(productId: string, publicUrl: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("not_found");

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId } }),
    prisma.productImage.create({
      data: {
        productId,
        url: publicUrl,
        sortOrder: 0,
        isPrimary: true,
      },
    }),
    prisma.productVariant.updateMany({
      where: { productId },
      data: { imageUrl: publicUrl },
    }),
  ]);

  revalidateCatalogProduct(product.slug);
}
