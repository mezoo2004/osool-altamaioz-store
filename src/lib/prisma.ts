import { PrismaClient } from "@prisma/client";
import { ensureDatabaseUrlPrepared } from "@/lib/database-url";

await ensureDatabaseUrlPrepared();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type DatabaseConnectionResult =
  | { ok: true; provider: "mysql" }
  | { ok: false; code: "missing_url" | "connection_failed"; message: string };

/** Safe connectivity probe — never logs credentials. */
export async function checkDatabaseConnection(): Promise<DatabaseConnectionResult> {
  if (!process.env.DATABASE_URL?.trim()) {
    return {
      ok: false,
      code: "missing_url",
      message: "DATABASE_URL is not configured.",
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1 AS ok`;
    return { ok: true, provider: "mysql" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database connection error.";
    return { ok: false, code: "connection_failed", message };
  }
}

/** Throws when DATABASE_URL is set but the database cannot be reached. */
export async function assertDatabaseConnection(): Promise<void> {
  const result = await checkDatabaseConnection();
  if (!result.ok) {
    const { DatabaseUnavailableError } = await import("@/lib/data/database-config");
    throw new DatabaseUnavailableError(result.message);
  }
}
