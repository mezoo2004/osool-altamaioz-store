#!/usr/bin/env node
/**
 * Verifies DATABASE_URL is set and MySQL is reachable.
 * Never prints credentials or the full DATABASE_URL.
 */
import {
  categorizeDatabaseError,
  loadEnvLocal,
  parseDatabaseUrlSafe,
  prepareDatabaseEnv,
} from "./lib/database-env.mjs";

await prepareDatabaseEnv();

const parsed = parseDatabaseUrlSafe(process.env.DATABASE_URL);
if (!parsed.ok) {
  console.error(`Database configuration error: ${parsed.issues.join(", ")}`);
  process.exit(1);
}

if (!process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL is not configured.");
  console.error("Add DATABASE_URL to .env.local — see docs/DATABASE_SETUP.md");
  process.exit(1);
}

let prisma;
try {
  const { PrismaClient } = await import("@prisma/client");
  prisma = new PrismaClient();
  await prisma.$queryRaw`SELECT 1 AS ok`;
  console.log("Database connection successful.");
  console.log("Engine: MySQL");
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const errno = error && typeof error === "object" && "errno" in error ? error.errno : undefined;
  console.error(`Database connection failed: ${categorizeDatabaseError(message, errno)}`);
  process.exit(1);
} finally {
  if (prisma) await prisma.$disconnect();
}
