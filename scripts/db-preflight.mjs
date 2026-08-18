#!/usr/bin/env node
/** Pre-push safety check — confirms target database and existing tables. No credentials printed. */
import { prepareDatabaseEnv, parseDatabaseUrlSafe } from "./lib/database-env.mjs";

await prepareDatabaseEnv();

const parsed = parseDatabaseUrlSafe(process.env.DATABASE_URL);
if (!parsed.ok || parsed.database !== "u847758257_osoolstore") {
  console.error("Unexpected database target — aborting.");
  process.exit(1);
}

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

try {
  const tables = await prisma.$queryRaw`
    SELECT TABLE_NAME as tableName, TABLE_ROWS as rowEstimate
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = ${parsed.database}
    ORDER BY TABLE_NAME
  `;

  const appTables = tables.filter((t) =>
    [
      "Product",
      "ProductVariant",
      "Category",
      "Customer",
      "Order",
      "OrderItem",
      "ImportBatch",
    ].includes(t.tableName),
  );

  console.log(
    JSON.stringify(
      {
        targetDatabase: parsed.database,
        targetUser: parsed.user,
        totalTables: tables.length,
        applicationTables: appTables.map((t) => ({
          name: t.tableName,
          approxRows: Number(t.rowEstimate),
        })),
        safeToPush: appTables.length === 0 || appTables.every((t) => Number(t.rowEstimate) === 0),
      },
      null,
      2,
    ),
  );

  const hasData = appTables.some((t) => Number(t.rowEstimate) > 0);
  if (hasData) {
    console.error("\nExisting application data detected — review before push.");
    process.exit(1);
  }
} finally {
  await prisma.$disconnect();
}
