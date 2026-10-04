import type { Prisma } from "@prisma/client";

/** Lightweight PLP row — one thumbnail variant, no specs/full gallery. */
export const catalogListProductArgs = {
  select: {
    id: true,
    slug: true,
    groupKey: true,
    nameAr: true,
    nameEn: true,
    series: true,
    productType: true,
    installationType: true,
    stockStatus: true,
    isFeatured: true,
    isNew: true,
    isBestseller: true,
    isOnOffer: true,
    createdAt: true,
    categoryLinks: {
      select: {
        isPrimary: true,
        category: { select: { slug: true } },
      },
    },
    images: {
      orderBy: { sortOrder: "asc" as const },
      take: 1,
      select: { url: true },
    },
    variants: {
      orderBy: [{ isDefault: "desc" as const }, { sku: "asc" as const }],
      take: 1,
      select: {
        id: true,
        sku: true,
        modelNumber: true,
        wattage: true,
        cct: true,
        finish: true,
        size: true,
        beamAngle: true,
        ipRating: true,
        voltage: true,
        length: true,
        price: true,
        salePrice: true,
        priceConfirmed: true,
        stockStatus: true,
        stockQty: true,
        imageUrl: true,
        nameAr: true,
        nameEn: true,
        attributes: true,
      },
    },
    _count: { select: { variants: true } },
  },
} satisfies { select: Prisma.ProductSelect };

export type CatalogListProductRow = Prisma.ProductGetPayload<typeof catalogListProductArgs>;
