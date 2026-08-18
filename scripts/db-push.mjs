#!/usr/bin/env node
/** Applies Prisma schema to MySQL — loads .env.local + IPv4 resolution first. */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepareDatabaseEnv } from "./lib/database-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

await prepareDatabaseEnv();

if (!process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL not configured.");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", "db", "push"], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
