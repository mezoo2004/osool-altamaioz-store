#!/usr/bin/env node
/** Promote an existing customer account to ADMIN (additive, safe). */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepareDatabaseEnv } from "./lib/database-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
await prepareDatabaseEnv();

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: node scripts/promote-admin.mjs user@example.com");
  process.exit(1);
}

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

try {
  const user = await prisma.customer.update({
    where: { email },
    data: { role: "ADMIN" },
  });
  console.log(`Promoted to ADMIN: ${user.email} (${user.id})`);
} catch (error) {
  console.error("Failed — ensure the customer exists and DATABASE_URL is configured.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
