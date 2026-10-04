#!/usr/bin/env node
/** Apply only slugs listed in data/reports/.batch-next.json from the assets folder. */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirIdx = process.argv.indexOf("--dir");
const dir = dirIdx >= 0 ? process.argv[dirIdx + 1] : null;
if (!dir) {
  console.error("usage: node scripts/product-ai-direct-apply-batch.mjs --dir ASSETS_DIR");
  process.exit(1);
}

const r = spawnSync(
  process.execPath,
  ["scripts/product-ai-direct-helpers.mjs", "apply-batch", "--dir", path.resolve(dir)],
  { cwd: root, stdio: "inherit" },
);
process.exit(r.status ?? 1);
