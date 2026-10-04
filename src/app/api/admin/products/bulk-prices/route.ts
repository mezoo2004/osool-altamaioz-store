import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { writeAdminAuditLog } from "@/lib/admin/audit-log";
import { requireAdminApi } from "@/lib/admin/api-guard";
import { revalidateCatalogProduct } from "@/lib/cache/revalidation";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const body = (await request.json()) as {
    confirm?: boolean;
    updates?: { productId: string; sellingPrice: number | null; compareAtPrice?: number | null }[];
    percentChange?: { direction: "increase" | "decrease"; percent: number; productIds: string[] };
  };

  if (!body.confirm) {
    return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
  }

  const slugs: string[] = [];

  if (body.updates?.length) {
    for (const row of body.updates) {
      const product = await prisma.product.findUnique({
        where: { id: row.productId },
        include: { variants: { orderBy: [{ isDefault: "desc" }, { sku: "asc" }] } },
      });
      if (!product) continue;
      const variant = product.variants[0];
      if (!variant) continue;
      const attrs = (variant.attributes ?? {}) as Record<string, unknown>;
      if (row.compareAtPrice === null) delete attrs.compareAtPrice;
      else if (typeof row.compareAtPrice === "number") attrs.compareAtPrice = row.compareAtPrice;

      await prisma.$transaction([
        prisma.product.update({
          where: { id: product.id },
          data: {
            basePrice: row.sellingPrice,
            priceConfirmed: row.sellingPrice != null,
          },
        }),
        prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            price: row.sellingPrice,
            priceConfirmed: row.sellingPrice != null,
            attributes: attrs as Prisma.InputJsonValue,
          },
        }),
      ]);
      slugs.push(product.slug);
    }
  }

  if (body.percentChange?.productIds.length) {
    const factor =
      body.percentChange.direction === "increase"
        ? 1 + body.percentChange.percent / 100
        : 1 - body.percentChange.percent / 100;
    if (factor <= 0) return NextResponse.json({ error: "invalid_percent" }, { status: 400 });

    const products = await prisma.product.findMany({
      where: { id: { in: body.percentChange.productIds } },
      include: { variants: { orderBy: [{ isDefault: "desc" }, { sku: "asc" }] } },
    });
    for (const product of products) {
      const variant = product.variants[0];
      if (!variant?.price) continue;
      const next = Math.round(variant.price.toNumber() * factor * 100) / 100;
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { price: next, priceConfirmed: true },
      });
      await prisma.product.update({
        where: { id: product.id },
        data: { basePrice: next, priceConfirmed: true },
      });
      slugs.push(product.slug);
    }
  }

  slugs.forEach((slug) => revalidateCatalogProduct(slug));

  await writeAdminAuditLog({
    adminId: guard.user.id,
    adminEmail: guard.user.email,
    action: "product.bulk_prices",
    entityType: "product",
    newValue: body,
  });

  return NextResponse.json({ ok: true, updated: slugs.length });
}
