import {
  buildCatalog,
  printImportSummary,
  summarizeDryRun,
} from "./lib/catalog-engine.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportsDir = path.join(__dirname, "..", "data", "reports");

const result = buildCatalog();
const summary = summarizeDryRun(result);

if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(
  path.join(reportsDir, "dry-run-summary.json"),
  JSON.stringify(summary, null, 2),
);

printImportSummary(summary);
console.log("DRY RUN — no catalog files modified.");
console.log(`Report: data/reports/dry-run-summary.json`);
