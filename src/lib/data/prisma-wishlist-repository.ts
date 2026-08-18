import type { WishlistRepository } from "@/lib/data/wishlist-repository";
import { prisma } from "@/lib/prisma";

export class PrismaWishlistRepository implements WishlistRepository {
  async list(customerId: string): Promise<string[]> {
    const rows = await prisma.wishlistItem.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      select: { productSlug: true },
    });
    return rows.map((r) => r.productSlug);
  }

  async add(customerId: string, productSlug: string): Promise<string[]> {
    await prisma.wishlistItem.upsert({
      where: { customerId_productSlug: { customerId, productSlug } },
      create: { customerId, productSlug },
      update: {},
    });
    return this.list(customerId);
  }

  async remove(customerId: string, productSlug: string): Promise<string[]> {
    await prisma.wishlistItem.deleteMany({ where: { customerId, productSlug } });
    return this.list(customerId);
  }

  async merge(customerId: string, productSlugs: string[]): Promise<string[]> {
    const unique = [...new Set(productSlugs.filter(Boolean))];
    if (!unique.length) return this.list(customerId);

    await prisma.$transaction(
      unique.map((productSlug) =>
        prisma.wishlistItem.upsert({
          where: { customerId_productSlug: { customerId, productSlug } },
          create: { customerId, productSlug },
          update: {},
        }),
      ),
    );

    return this.list(customerId);
  }
}
