#!/usr/bin/env node
/**
 * Helpers for Cursor GenerateImage → catalog main.webp pipeline.
 *
 *   node scripts/product-ai-direct-helpers.mjs export-queue
 *   node scripts/product-ai-direct-helpers.mjs apply --slug SLUG --source PATH
 *   node scripts/product-ai-direct-helpers.mjs apply-batch --dir PATH
 *   node scripts/product-ai-direct-helpers.mjs summary
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { wrapMasterPrompt, buildMasterPromptDescription } from "./lib/product-image-pipeline/description.mjs";
import { slugToDir } from "./lib/product-image-pipeline/keys.mjs";
import { normalizeSourceToMain } from "./lib/product-image-pipeline/render.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "data", "catalog", "products.json");
const reportsDir = path.join(root, "data", "reports");
const progressPath = path.join(reportsDir, "product-ai-direct-progress.json");
const summaryPath = path.join(reportsDir, "product-ai-direct-summary.json");
const publicRoot = path.join(root, "public", "product-images");

function slugFile(slug) {
  return `${String(slug).slice(0, 72)}.jpg`;
}

function pickDefaultVariant(product) {
  return product.variants?.[0] ?? null;
}

function publicUrl(slugDir) {
  return `/product-images/${slugDir}/main.webp`;
}

function loadProgress() {
  if (!fs.existsSync(progressPath)) {
    return { completed: {}, failed: {}, updatedAt: null };
  }
  return JSON.parse(fs.readFileSync(progressPath, "utf8"));
}

function saveProgress(progress) {
  fs.mkdirSync(reportsDir, { recursive: true });
  progress.updatedAt = new Date().toISOString();
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

function loadProducts() {
  return JSON.parse(fs.readFileSync(catalogPath, "utf8"));
}

function buildJob(product) {
  const variant = pickDefaultVariant(product);
  if (!variant) return null;
  const slugDir = slugToDir(product.slug);
  const desc = buildMasterPromptDescription(product, variant);
  const prompt = wrapMasterPrompt(desc);
  return {
    slug: product.slug,
    slugDir,
    filename: slugFile(product.slug),
    mainRel: publicUrl(slugDir),
    mainAbs: path.join(publicRoot, slugDir, "main.webp"),
    prompt,
    sku: variant.sku ?? null,
  };
}

function exportQueue() {
  const products = loadProducts();
  const progress = loadProgress();
  const jobs = [];
  for (const product of products) {
    const job = buildJob(product);
    if (!job) continue;
    if (progress.completed[job.slug]) continue;
    jobs.push(job);
  }
  process.stdout.write(JSON.stringify({ total: products.length, pending: jobs.length, jobs }, null, 2));
}

async function applyOne(slug, sourcePath, { persistCatalog = true } = {}) {
  const products = loadProducts();
  const product = products.find((p) => p.slug === slug);
  if (!product) throw new Error(`unknown slug: ${slug}`);
  const job = buildJob(product);
  if (!job) throw new Error(`no variant for ${slug}`);
  if (!fs.existsSync(sourcePath)) throw new Error(`missing source: ${sourcePath}`);

  await normalizeSourceToMain(sourcePath, job.mainAbs);
  product.galleryImages = [job.mainRel];
  for (const v of product.variants ?? []) {
    v.imageUrl = job.mainRel;
  }
  if (persistCatalog) {
    fs.writeFileSync(catalogPath, JSON.stringify(products, null, 2));
  }

  const progress = loadProgress();
  progress.completed[slug] = {
    at: new Date().toISOString(),
    source: sourcePath,
    main: job.mainRel,
  };
  delete progress.failed[slug];
  saveProgress(progress);
  return job.mainRel;
}

async function applyBatchFromNext(assetsDir) {
  const batchPath = path.join(reportsDir, ".batch-next.json");
  if (!fs.existsSync(batchPath)) {
    throw new Error("missing data/reports/.batch-next.json — run product-ai-direct-next-batch.mjs first");
  }
  const jobs = JSON.parse(fs.readFileSync(batchPath, "utf8"));
  const progress = loadProgress();
  const applied = [];
  const missing = [];

  for (const job of jobs) {
    if (progress.completed[job.slug]) continue;
    const candidates = [
      path.join(assetsDir, job.filename),
      path.join(assetsDir, job.filename.replace(/\.jpg$/i, ".jpeg")),
      path.join(assetsDir, job.filename.replace(/\.jpg$/i, ".png")),
    ];
    const sourcePath = candidates.find((p) => fs.existsSync(p));
    if (!sourcePath) {
      missing.push({ slug: job.slug, reason: "no_asset" });
      continue;
    }
    try {
      await applyOne(job.slug, sourcePath, { persistCatalog: true });
      applied.push(job.slug);
    } catch (e) {
      markFailed(job.slug, e.message);
      missing.push({ slug: job.slug, reason: String(e.message ?? e) });
    }
  }

  return { applied, missing, appliedCount: applied.length };
}

async function applyAssetsDir(assetsDir) {
  const products = loadProducts();
  const byFilename = new Map();
  for (const product of products) {
    const job = buildJob(product);
    if (job) byFilename.set(job.filename.toLowerCase(), job);
  }

  const progress = loadProgress();
  const applied = [];
  const missing = [];

  const entries = fs.readdirSync(assetsDir).filter((f) => /\.jpe?g$/i.test(f));
  for (const file of entries) {
    const job = byFilename.get(file.toLowerCase());
    if (!job) continue;
    if (progress.completed[job.slug]) continue;
    const sourcePath = path.join(assetsDir, file);
    try {
      await normalizeSourceToMain(sourcePath, job.mainAbs);
      const product = products.find((p) => p.slug === job.slug);
      product.galleryImages = [job.mainRel];
      for (const v of product.variants ?? []) {
        v.imageUrl = job.mainRel;
      }
      progress.completed[job.slug] = {
        at: new Date().toISOString(),
        source: sourcePath,
        main: job.mainRel,
      };
      delete progress.failed[job.slug];
      applied.push(job.slug);
    } catch (e) {
      progress.failed[job.slug] = { at: new Date().toISOString(), error: String(e.message ?? e) };
      missing.push({ slug: job.slug, error: String(e.message ?? e) });
    }
  }

  fs.writeFileSync(catalogPath, JSON.stringify(products, null, 2));
  saveProgress(progress);
  return { applied, missing, appliedCount: applied.length };
}

function markFailed(slug, error) {
  const progress = loadProgress();
  progress.failed[slug] = { at: new Date().toISOString(), error: String(error) };
  saveProgress(progress);
}

function writeSummary() {
  const products = loadProducts();
  const progress = loadProgress();
  const completed = Object.keys(progress.completed).length;
  const failed = Object.keys(progress.failed).length;
  const pending = products.length - completed - failed;
  const summary = {
    generatedAt: new Date().toISOString(),
    totalCatalog: products.length,
    aiDirectCompleted: completed,
    aiDirectFailed: failed,
    aiDirectPending: Math.max(0, pending),
    method: "CURSOR_GENERATE_IMAGE",
  };
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "export-queue") {
  exportQueue();
} else if (cmd === "apply") {
  const slugIdx = rest.indexOf("--slug");
  const srcIdx = rest.indexOf("--source");
  const slug = rest[slugIdx + 1];
  const source = rest[srcIdx + 1];
  if (!slug || !source) {
    console.error("usage: apply --slug SLUG --source PATH");
    process.exit(1);
  }
  applyOne(slug, path.resolve(source))
    .then((url) => console.log(JSON.stringify({ ok: true, slug, url })))
    .catch((e) => {
      markFailed(slug, e.message);
      console.error(e);
      process.exit(1);
    });
} else if (cmd === "apply-assets-dir") {
  const dirIdx = rest.indexOf("--dir");
  const dir = dirIdx >= 0 ? rest[dirIdx + 1] : null;
  if (!dir) {
    console.error("usage: apply-assets-dir --dir PATH");
    process.exit(1);
  }
  applyAssetsDir(path.resolve(dir))
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} else if (cmd === "apply-batch") {
  const dirIdx = rest.indexOf("--dir");
  const dir = dirIdx >= 0 ? rest[dirIdx + 1] : null;
  if (!dir) {
    console.error("usage: apply-batch --dir PATH");
    process.exit(1);
  }
  applyBatchFromNext(path.resolve(dir))
    .then((r) => {
      console.log(JSON.stringify(r, null, 2));
      writeSummary();
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} else if (cmd === "summary") {
  writeSummary();
} else if (cmd === "fail") {
  const slugIdx = rest.indexOf("--slug");
  const errIdx = rest.indexOf("--error");
  markFailed(rest[slugIdx + 1], rest[errIdx + 1] ?? "unknown");
} else {
  console.error("commands: export-queue | apply | summary | fail");
  process.exit(1);
}
