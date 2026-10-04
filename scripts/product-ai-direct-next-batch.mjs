#!/usr/bin/env node
/** Print next N pending jobs as JSON (stdout). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const queuePath = path.join(root, "data", "reports", "product-ai-direct-queue.json");
const progressPath = path.join(root, "data", "reports", "product-ai-direct-progress.json");

const n = Number(process.argv[2] ?? 20);
const q = JSON.parse(fs.readFileSync(queuePath, "utf8"));
const progress = fs.existsSync(progressPath)
  ? JSON.parse(fs.readFileSync(progressPath, "utf8"))
  : { completed: {}, failed: {} };

const jobs = q.jobs.filter((j) => !progress.completed[j.slug]).slice(0, n);
const outPath = path.join(root, "data", "reports", ".batch-next.json");
fs.writeFileSync(outPath, JSON.stringify(jobs, null, 2));
console.log(JSON.stringify({ count: jobs.length, first: jobs[0]?.slug, last: jobs.at(-1)?.slug, outPath }));
