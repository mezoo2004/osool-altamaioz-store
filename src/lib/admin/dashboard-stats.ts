import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

const PENDING_REVIEWS = path.join(process.cwd(), "data", "reviews", "pending-submissions.json");

export async function getAdminDashboardStats() {
  if (!process.env.DATABASE_URL?.trim()) {
    return null;
  }

  const [
    totalProducts,
    activeProducts,
    pricedVariants,
    totalVariants,
    categories,
    recentOrders,
    activeOffers,
    imageRows,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.productVariant.count({ where: { priceConfirmed: true, price: { not: null } } }),
    prisma.productVariant.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        grandTotal: true,
        createdAt: true,
        guestEmail: true,
        guestPhone: true,
      },
    }),
    prisma.product.count({ where: { isOnOffer: true, status: "ACTIVE" } }),
    prisma.productImage.count(),
  ]);

  let pendingReviews = 0;
  if (fs.existsSync(PENDING_REVIEWS)) {
    try {
      const rows = JSON.parse(fs.readFileSync(PENDING_REVIEWS, "utf8")) as { status: string }[];
      pendingReviews = rows.filter((r) => r.status === "PENDING").length;
    } catch {
      pendingReviews = 0;
    }
  }
  pendingReviews += await prisma.customerReview.count({ where: { status: "PENDING" } });

  const promotionsActive = await prisma.promotion.count({
    where: { status: { in: ["ACTIVE", "SCHEDULED"] }, popupEnabled: true },
  });

  const salesSummary = await prisma.order.aggregate({
    where: { paymentStatus: { in: ["PAID", "AUTHORIZED"] } },
    _sum: { grandTotal: true },
    _count: { id: true },
  });

  return {
    totalProducts,
    activeProducts,
    productsWithPrice: pricedVariants,
    productsMissingPrice: Math.max(0, totalVariants - pricedVariants),
    categories,
    pendingReviews,
    activeOffers,
    promotionsActive,
    imageStatus: {
      productImages: imageRows,
      catalogProducts: totalProducts,
    },
    recentOrders,
    salesSummary: {
      paidOrders: salesSummary._count.id,
      revenue: salesSummary._sum.grandTotal?.toNumber() ?? 0,
    },
  };
}
