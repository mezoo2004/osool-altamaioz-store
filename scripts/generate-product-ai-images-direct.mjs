#!/usr/bin/env node
/**
 * Direct AI raster → normalized main.webp + catalog apply (resume + retries).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvLocal } from "./lib/product-image-pipeline/env.mjs";
import { slugToDir } from "./lib/product-image-pipeline/keys.mjs";
import { isGeminiImageAvailable, generateGeminiMain } from "./lib/product-image-pipeline/gemini-image.mjs";
import { normalizeSourceToMain } from "./lib/product-image-pipeline/render.mjs";
import { validateMainImage } from "./lib/product-image-pipeline/normalize.mjs";
import { isOpenAiImageAvailable, generateOpenAiMain } from "./lib/product-image-pipeline/openai-image.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadEnvLocal(root);

const catalogPath = path.join(root, "data", "catalog", "products.json");
const reportsDir = path.join(root, "data", "reports");
const progressPath = path.join(reportsDir, "product-ai-direct-progress.json");
const failuresPath = path.join(reportsDir, "product-ai-direct-failures.json");
const publicRoot = path.join(root, "public", "product-images");
const tmpDir = path.join(reportsDir, ".ai-direct-tmp");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const force = args.includes("--force");

function parseNum(flag, fallback) {
  const i = args.indexOf(flag);
  if (i === -1) return null;
  const n = Number(args[i + 1]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const concurrency = parseNum("--concurrency", 3) ?? 3;
const limit = parseNum("--limit", null);

const MAX_ATTEMPTS = 4;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadProgress() {
  if (!fs.existsSync(progressPath)) return { completed: {}, failed: {} };
  return JSON.parse(fs.readFileSync(progressPath, "utf8"));
}

function saveProgress(progress) {
  fs.mkdirSync(reportsDir, { recursive: true });
  progress.updatedAt = new Date().toISOString();
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

function pickVariant(product) {
  return product.variants?.[0] ?? null;
}

async function generateRaster(product, variant) {
  if (isGeminiImageAvailable()) {
    return { path: await generateGeminiMain(product, variant, tmpDir), provider: "google-gemini" };
  }
  if (isOpenAiImageAvailable()) {
    const p = await generateOpenAiMain(product, variant, tmpDir);
    if (p) return { path: p, provider: "openai" };
  }
  throw new Error("no_ai_provider: set GEMINI_API_KEY or OPENAI_API_KEY in .env.local");
}

async function generateOne(product, progress) {
  const variant = pickVariant(product);
  const slugDir = slugToDir(product.slug);
  const mainPath = path.join(publicRoot, slugDir, "main.webp");
  const publicUrl = `/product-images/${slugDir}/main.webp`;
  const sku = variant?.sku ?? null;

  if (!variant) {
    return { slug: product.slug, sku, ok: false, reason: "no_variant" };
  }

  if (!force && progress.completed[product.slug]) {
    return { slug: product.slug, sku, ok: true, skipped: true, publicUrl };
  }

  if (!apply) {
    return { slug: product.slug, sku, ok: true, dryRun: true };
  }

  let lastError = "unknown";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { path: rasterPath, provider } = await generateRaster(product, variant);
      await normalizeSourceToMain(rasterPath, mainPath);
      await fs.promises.unlink(rasterPath).catch(() => {});

      const check = await validateMainImage(mainPath);
      if (!check.ok) throw new Error(check.reason ?? "validation_failed");

      progress.completed[product.slug] = {
        at: new Date().toISOString(),
        provider,
        sku,
        main: publicUrl,
      };
      delete progress.failed[product.slug];
      saveProgress(progress);

      return { slug: product.slug, sku, ok: true, publicUrl, generated: true };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      const backoff = Math.min(30_000, 2000 * 2 ** (attempt - 1));
      if (/429|rate|quota|RESOURCE_EXHAUSTED/i.test(lastError)) {
        await sleep(backoff + 1000);
      } else if (attempt < MAX_ATTEMPTS) {
        await sleep(backoff);
      }
    }
  }

  progress.failed[product.slug] = {
    at: new Date().toISOString(),
    sku,
    error: lastError,
  };
  saveProgress(progress);
  return { slug: product.slug, sku, ok: false, reason: lastError };
}

async function poolMap(items, worker, size) {
  const results = new Array(items.length);
  let next = 0;

  async function runWorker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
      if ((i + 1) % 25 === 0 || i + 1 === items.length) {
        console.log(`  progress ${i + 1}/${items.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => runWorker()));
  return results;
}

function applyCatalog(products, bySlug) {
  for (const p of products) {
    const row = bySlug.get(p.slug);
    if (!row?.ok || !row.publicUrl) continue;
    p.galleryImages = [row.publicUrl];
    for (const v of p.variants ?? []) v.imageUrl = row.publicUrl;
  }
}

async function main() {
  const products = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const batch = limit ? products.slice(0, limit) : products;
  const progress = loadProgress();

  console.log(
    `Direct AI images: ${batch.length} products, concurrency ${concurrency}, apply=${apply}, force=${force}`,
  );

  const results = await poolMap(
    batch,
    (p) => generateOne(p, progress),
    concurrency,
  );
  const bySlug = new Map(results.map((r) => [r.slug, r]));

  const generated = results.filter((r) => r.generated).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.filter((r) => !r.ok);

  if (apply) {
    applyCatalog(products, bySlug);
    fs.writeFileSync(catalogPath, JSON.stringify(products, null, 2));
  }

  await fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});

  const summary = {
    generatedAt: new Date().toISOString(),
    total: batch.length,
    aiGenerated: generated,
    skippedResume: skipped,
    failed: failed.length,
    provider: isGeminiImageAvailable() ? "google-gemini" : "openai",
  };
  fs.writeFileSync(path.join(reportsDir, "product-ai-direct-summary.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(
    failuresPath,
    JSON.stringify(
      failed.map((f) => ({ slug: f.slug, sku: f.sku, reason: f.reason })),
      null,
      2,
    ),
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
