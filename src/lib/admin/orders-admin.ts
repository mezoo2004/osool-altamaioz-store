import { prisma } from "@/lib/prisma";

export async function listAdminOrders(input: { page?: number; pageSize?: number }) {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, input.pageSize ?? 25));

  const [total, items] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        grandTotal: true,
        guestEmail: true,
        guestPhone: true,
        createdAt: true,
        customer: { select: { email: true, phone: true } },
      },
    }),
  ]);

  return { total, page, pageSize, items };
}
