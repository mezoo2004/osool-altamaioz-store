import {
  buildCatalog,
  printImportSummary,
  summarizeDryRun,
  writeCatalogOutputs,
} from "./lib/catalog-engine.mjs";
import { prepareDatabaseEnv } from "./lib/database-env.mjs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const syncDb = process.argv.includes("--sync-db");

console.log("\n📦 Catalog apply — intentional import operation\n");

const result = buildCatalog();
const summary = summarizeDryRun(result);

if (summary.products.conflict > 0) {
  console.warn(`\n⚠ ${summary.products.conflict} conflict(s) detected — review data/reports/import-conflicts.json`);
}

writeCatalogOutputs(result);

printImportSummary(summary);
console.log("APPLIED — catalog JSON updated in data/catalog/");

if (syncDb) {
  await prepareDatabaseEnv();

  if (!process.env.DATABASE_URL?.trim()) {
    console.log("\n⚠ DATABASE_URL not set — skipped DB sync. JSON catalog updated only.");
    process.exit(0);
  }

  console.log("\nRunning data:validate before MySQL sync...");
  const validate = spawnSync("node", [path.join(__dirname, "data-validate.mjs")], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (validate.status !== 0) {
    console.error("\nValidation failed — MySQL sync aborted.");
    process.exit(validate.status ?? 1);
  }

  console.log("\nSyncing to MySQL...");
  const res = spawnSync("node", [path.join(__dirname, "sync-catalog-to-db.mjs")], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (res.status !== 0) process.exit(res.status ?? 1);

  console.log("\nRun npm run db:verify to confirm database contents.");
}
