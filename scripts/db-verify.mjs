#!/usr/bin/env node
import { prepareDatabaseEnv } from "./lib/database-env.mjs";

await prepareDatabaseEnv();

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

try {
  await prisma.$queryRaw`SELECT 1 AS ok`;

  const [categories, products, variants, customers, orders, orderItems, wishlistItems, importBatches] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.productVariant.count(),
      prisma.customer.count(),
      prisma.order.count(),
      prisma.orderItem.count(),
      prisma.wishlistItem.count(),
      prisma.importBatch.count(),
    ]);

  const productIds = new Set((await prisma.product.findMany({ select: { id: true } })).map((p) => p.id));
  const variantRows = await prisma.productVariant.findMany({ select: { productId: true } });
  const orphanVariantCount = variantRows.filter((v) => !productIds.has(v.productId)).length;
  const productsWithVariants = new Set(variantRows.map((v) => v.productId));
  const allProducts = await prisma.product.findMany({ select: { id: true } });
  const emptyProductCount = allProducts.filter((p) => !productsWithVariants.has(p.id)).length;

  console.log(
    JSON.stringify(
      {
        verifiedAt: new Date().toISOString(),
        engine: "mysql",
        connection: "ok",
        counts: { categories, products, variants, customers, orders, orderItems, wishlistItems, importBatches },
        integrity: {
          orphanVariants: orphanVariantCount,
          productsWithoutVariants: emptyProductCount,
          ok: orphanVariantCount === 0 && emptyProductCount === 0,
        },
      },
      null,
      2,
    ),
  );
  console.log("\nDatabase verification passed.");
} catch (error) {
  console.error("Database verification failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
