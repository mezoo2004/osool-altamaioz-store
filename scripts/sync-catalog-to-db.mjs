#!/usr/bin/env node
/**
 * Sync data/catalog/*.json → MySQL via Prisma.
 * Idempotent, incremental, chunked transactions. Safe to rerun for future batches.
 * Never imports ambiguous source prices — priceConfirmed stays false.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { normalizeSku } from "./lib/catalog-import.mjs";
import { prepareDatabaseEnv } from "./lib/database-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const CHUNK_SIZE = 25;
/** Remote Hostinger MySQL needs longer interactive transaction windows than Prisma's 5s default. */
const TX_OPTIONS = { maxWait: 30_000, timeout: 120_000 };

function slugToNames(slug) {
  const nameEn = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return { nameAr: nameEn, nameEn };
}

function runValidation() {
  const result = spawnSync("node", [path.join(__dirname, "data-validate.mjs")], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    console.error("\nCatalog validation failed — fix errors before syncing to MySQL.");
    process.exit(1);
  }
}

async function upsertCategories(tx, discovered) {
  let count = 0;
  for (const entry of discovered) {
    const { nameAr, nameEn } = slugToNames(entry.slug);
    await tx.category.upsert({
      where: { slug: entry.slug },
      create: {
        slug: entry.slug,
        nameAr,
        nameEn,
        isActive: entry.slug !== "UNMAPPED_CATEGORY",
        sortOrder: 0,
      },
      update: {
        nameAr,
        nameEn,
        isActive: entry.slug !== "UNMAPPED_CATEGORY",
        updatedAt: new Date(),
      },
    });
    count++;
  }
  return count;
}

async function syncProductChunk(tx, products, categoryIdBySlug) {
  let productUpserts = 0;
  let variantUpserts = 0;
  let linkUpserts = 0;

  for (const p of products) {
    await tx.product.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        slug: p.slug,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        series: p.series,
        groupKey: p.groupKey ?? null,
        productType: p.productType ?? null,
        installationType: p.installationType ?? null,
        status: "ACTIVE",
        stockStatus: p.stockStatus ?? "OUT_OF_STOCK",
        isFeatured: p.isFeatured ?? false,
        isNew: p.isNew ?? false,
        isBestseller: p.isBestseller ?? false,
        isOnOffer: p.isOnOffer ?? false,
        priceConfirmed: false,
        sourceBatchId: p.importBatch ?? null,
        importMeta: p.importMeta ?? undefined,
      },
      update: {
        slug: p.slug,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        series: p.series,
        groupKey: p.groupKey ?? null,
        productType: p.productType ?? null,
        installationType: p.installationType ?? null,
        stockStatus: p.stockStatus ?? "OUT_OF_STOCK",
        sourceBatchId: p.importBatch ?? null,
        importMeta: p.importMeta ?? undefined,
        updatedAt: new Date(),
      },
    });
    productUpserts++;

    for (const slug of p.categorySlugs ?? []) {
      const categoryId = categoryIdBySlug.get(slug);
      if (!categoryId) continue;
      await tx.productCategory.upsert({
        where: {
          productId_categoryId: { productId: p.id, categoryId },
        },
        create: {
          productId: p.id,
          categoryId,
          isPrimary: slug === p.primaryCategory,
        },
        update: {
          isPrimary: slug === p.primaryCategory,
        },
      });
      linkUpserts++;
    }

    for (const v of p.variants ?? []) {
      const norm = normalizeSku(v.sku);
      await tx.productVariant.upsert({
        where: { sku: v.sku },
        create: {
          id: v.id,
          productId: p.id,
          sku: v.sku,
          normalizedSku: norm,
          modelNumber: v.modelNumber,
          wattage: v.wattage,
          cct: v.cct,
          finish: v.finish,
          priceConfirmed: false,
          stockStatus: v.stockStatus ?? "OUT_OF_STOCK",
          stockQty: v.stockQty ?? 0,
          imageUrl: v.imageUrl ?? null,
          nameAr: v.nameAr,
          nameEn: v.nameEn,
          attributes: v.cctLabel ? { cctLabel: v.cctLabel } : undefined,
          sourceBatchId: v.importMeta?.sourceBatch ?? p.importBatch ?? null,
          sourceFile: v.importMeta?.sourceFile ?? null,
          sourceRowRef: v.importMeta?.sourceRowRef ?? null,
          importMeta: v.importMeta ?? undefined,
        },
        update: {
          productId: p.id,
          normalizedSku: norm,
          wattage: v.wattage,
          cct: v.cct,
          finish: v.finish,
          stockStatus: v.stockStatus ?? "OUT_OF_STOCK",
          stockQty: v.stockQty ?? 0,
          imageUrl: v.imageUrl ?? null,
          nameAr: v.nameAr,
          nameEn: v.nameEn,
          importMeta: v.importMeta ?? undefined,
          updatedAt: new Date(),
        },
      });
      variantUpserts++;
    }
  }

  return { productUpserts, variantUpserts, linkUpserts };
}

async function main() {
  await prepareDatabaseEnv();

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL not configured — cannot sync to MySQL.");
    console.error("See docs/DATABASE_SETUP.md");
    process.exit(1);
  }

  runValidation();

  const catalogPath = path.join(root, "data", "catalog", "products.json");
  const categoriesPath = path.join(root, "data", "catalog", "discovered-categories.json");
  const reportPath = path.join(root, "data", "catalog", "grouping-report.json");

  if (!fs.existsSync(catalogPath)) {
    console.error("No catalog at data/catalog/products.json — run catalog:apply first.");
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const discovered = fs.existsSync(categoriesPath)
    ? JSON.parse(fs.readFileSync(categoriesPath, "utf8")).categories ?? []
    : [];
  const groupingReport = fs.existsSync(reportPath)
    ? JSON.parse(fs.readFileSync(reportPath, "utf8"))
    : null;

  const conflictPath = path.join(root, "data", "reports", "import-conflicts.json");
  if (fs.existsSync(conflictPath)) {
    const conflicts = JSON.parse(fs.readFileSync(conflictPath, "utf8"));
    if (conflicts.totalConflicts > 0) {
      console.warn(
        `Warning: ${conflicts.totalConflicts} import conflict(s) reported — review data/reports/import-conflicts.json`,
      );
    }
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  let categoryUpserts = 0;
  let productUpserts = 0;
  let variantUpserts = 0;
  let linkUpserts = 0;

  try {
    await prisma.$transaction(async (tx) => {
      categoryUpserts = await upsertCategories(tx, discovered);
    }, TX_OPTIONS);

    const categoryRows = await prisma.category.findMany({ select: { id: true, slug: true } });
    const categoryIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
      const chunk = products.slice(i, i + CHUNK_SIZE);
      const stats = await prisma.$transaction(
        async (tx) => syncProductChunk(tx, chunk, categoryIdBySlug),
        TX_OPTIONS,
      );
      productUpserts += stats.productUpserts;
      variantUpserts += stats.variantUpserts;
      linkUpserts += stats.linkUpserts;
      console.log(`Synced products ${Math.min(i + CHUNK_SIZE, products.length)}/${products.length}`);
    }

    if (groupingReport?.importBatch) {
      const batchId = groupingReport.importBatch;
      await prisma.importBatch.upsert({
        where: { id: batchId },
        create: {
          id: batchId,
          sourceFile: groupingReport.importBatch,
          sourceType: "excel",
          label: groupingReport.importBatch,
          sourceFiles: [],
          rowCount: groupingReport.rawVariantCount ?? 0,
          productCount: groupingReport.groupedProductCount ?? products.length,
          variantCount: groupingReport.rawVariantCount ?? variantUpserts,
          createdCount: groupingReport.importStats?.variantsCreated ?? 0,
          updatedCount: groupingReport.importStats?.variantsUpdated ?? 0,
          skippedCount: groupingReport.importStats?.variantsSkipped ?? 0,
          conflictCount: groupingReport.conflictCount ?? 0,
          status: "APPLIED",
          notes: groupingReport.catalogScopeNote ?? null,
          reportPath: "data/catalog/grouping-report.json",
        },
        update: {
          rowCount: groupingReport.rawVariantCount ?? 0,
          productCount: groupingReport.groupedProductCount ?? products.length,
          variantCount: groupingReport.rawVariantCount ?? variantUpserts,
          updatedCount: groupingReport.importStats?.variantsUpdated ?? 0,
          conflictCount: groupingReport.conflictCount ?? 0,
          status: "APPLIED",
          updatedAt: new Date(),
        },
      });
    }

    console.log(
      JSON.stringify(
        {
          catalogScope: "initial-imported-sample",
          categoryUpserts,
          productUpserts,
          variantUpserts,
          categoryLinkUpserts: linkUpserts,
          sampleNote: "Current counts reflect imported sample only — NOT the final catalog.",
          priceConfirmed: false,
          nextStep: "npm run db:verify",
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
