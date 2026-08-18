#!/usr/bin/env node
/**
 * Run an incremental product import batch.
 *
 * Usage:
 *   node scripts/import-batch.mjs
 *   node scripts/import-batch.mjs --batch batch-002
 *   IMPORT_BATCH=batch-002 node scripts/import-batch.mjs
 *
 * Steps:
 *   1. analyze-products.mjs  → data/import/*.json
 *   2. build-catalog.mjs     → data/catalog/products.json (merge/idempotent)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function parseArgs() {
  const args = process.argv.slice(2);
  let batch = process.env.IMPORT_BATCH ?? "batch-001";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--batch" && args[i + 1]) {
      batch = args[i + 1];
      i++;
    }
  }
  return { batch };
}

function run(script, extraEnv = {}) {
  const res = spawnSync("node", [path.join(__dirname, script)], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

const { batch } = parseArgs();
const batchDir = path.join(root, "data", "import", "batches", batch);
if (!fs.existsSync(batchDir)) fs.mkdirSync(batchDir, { recursive: true });

console.log(`\n📦 Import batch: ${batch}\n`);

run("analyze-products.mjs", { IMPORT_BATCH: batch });
run("build-catalog.mjs", { IMPORT_BATCH: batch });

console.log(`\n✅ Batch ${batch} complete. Review:`);
console.log(`   - data/catalog/grouping-report.json`);
console.log(`   - data/catalog/conflict-report.json`);
console.log(`   - data/catalog/discovered-categories.json\n`);
