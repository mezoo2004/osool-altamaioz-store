#!/usr/bin/env node
/**
 * Full-catalog main product image pipeline (single main.webp per product).
 *
 *   node scripts/build-product-image-catalog.mjs --apply --allow-generated
 *   node scripts/build-product-image-catalog.mjs --limit 20 --apply --allow-generated
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvLocal } from "./lib/product-image-pipeline/env.mjs";
import { buildMatchKeys, slugToDir } from "./lib/product-image-pipeline/keys.mjs";
import {
  findBestSourceCandidate,
  loadManifest,
  scanSourceDirectory,
} from "./lib/product-image-pipeline/sources.mjs";
import {
  normalizeSourceToMain,
  renderMetadataStudioToMain,
} from "./lib/product-image-pipeline/render.mjs";
import { validateMainImage, CATALOG_CANVAS } from "./lib/product-image-pipeline/normalize.mjs";
import { isOpenAiImageAvailable, generateOpenAiMain } from "./lib/product-image-pipeline/openai-image.mjs";
import { wrapMasterPrompt, buildMasterPromptDescription } from "./lib/product-image-pipeline/description.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadEnvLocal(root);

const catalogPath = path.join(root, "data", "catalog", "products.json");
const reportsDir = path.join(root, "data", "reports");
const tmpGenDir = path.join(reportsDir, ".image-gen-tmp");
const sourcesRoot = path.join(root, "references", "product-images");
const manifestPath = path.join(sourcesRoot, "manifest.json");
const publicRoot = path.join(root, "public", "product-images");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const allowGenerated = args.includes("--allow-generated");
const skipNormalizePass = args.includes("--skip-normalize-pass");

function parseLimit(argv) {
  const idx = argv.indexOf("--limit");
  if (idx === -1) return null;
  const n = Number(argv[idx + 1]);
  return Number.isFinite(n) ? n : null;
}
const limit = parseLimit(args);

async function fetchUrlToTemp(url, slug) {
  const res = await fetch(url, { signal: AbortSignal.timeout(25_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = path.extname(new URL(url).pathname) || ".jpg";
  const tmp = path.join(tmpGenDir, `fetch-${slug.slice(0, 40)}${ext}`);
  await fs.promises.mkdir(tmpGenDir, { recursive: true });
  await fs.promises.writeFile(tmp, buf);
  return tmp;
}

function pickDefaultVariant(product) {
  return product.variants?.[0] ?? null;
}

function publicUrl(slugDir) {
  return `/product-images/${slugDir}/main.webp`;
}

function mapMethod({ exactSource, openAi, metadataStudio, highConfidenceFile }) {
  if (exactSource) return "EXACT_SOURCE";
  if (openAi) return "REFERENCE_BASED_AI";
  if (highConfidenceFile) return "EXACT_SOURCE";
  if (metadataStudio) return "METADATA_BASED_AI";
  return "FAILED";
}

async function processProduct(product, ctx) {
  const variant = pickDefaultVariant(product);
  const slugDir = slugToDir(product.slug);
  const outDir = path.join(publicRoot, slugDir);
  const mainPath = path.join(outDir, "main.webp");
  const imagePath = publicUrl(slugDir);

  if (!variant) {
    return {
      slug: product.slug,
      sku: null,
      titleAr: product.nameAr,
      titleEn: product.nameEn,
      category: product.primaryCategory,
      imagePath: null,
      method: "FAILED",
      confidence: "low",
      source: null,
      reference: null,
      manualReview: true,
      error: "no_variant",
      applied: false,
    };
  }

  const matchKeys = buildMatchKeys(product, variant);
  const candidate = findBestSourceCandidate({
    product,
    variant,
    sourceFiles: ctx.sourceFiles,
    manifestMap: ctx.manifestMap,
    matchKeys,
  });

  let method = "FAILED";
  let source = null;
  let reference = null;
  let manualReview = false;
  let error = null;
  let applied = false;

  try {
    const exactSource =
      candidate &&
      (candidate.confidence === "EXACT" ||
        (candidate.confidence === "HIGH_CONFIDENCE" && candidate.score >= 100));

    const highConfidenceFile =
      candidate?.path && candidate.confidence === "HIGH_CONFIDENCE" && candidate.score >= 85;

    if (candidate?.path || candidate?.url) {
      if (apply) {
        let sourcePath = candidate.path;
        if (candidate.url) {
          sourcePath = await fetchUrlToTemp(candidate.url, product.slug);
          source = "catalog_url_fetch";
        } else {
          source = candidate.source ?? "local_file";
        }
        await normalizeSourceToMain(sourcePath, mainPath);
        reference = candidate.url ?? candidate.path;
      } else {
        source = candidate.url ? "catalog_url" : candidate.source;
        reference = candidate.url ?? candidate.path;
      }
      method = exactSource || highConfidenceFile ? "EXACT_SOURCE" : "REFERENCE_BASED_AI";
      manualReview = !exactSource && !highConfidenceFile;
    } else if (allowGenerated) {
      if (apply) {
        const openAiPath = isOpenAiImageAvailable()
          ? await generateOpenAiMain(product, variant, tmpGenDir)
          : null;
        if (openAiPath) {
          await normalizeSourceToMain(openAiPath, mainPath);
          method = "REFERENCE_BASED_AI";
          source = "openai_gpt-image-1";
          reference = wrapMasterPrompt(buildMasterPromptDescription(product, variant));
          manualReview = true;
          await fs.promises.unlink(openAiPath).catch(() => {});
        } else {
          await renderMetadataStudioToMain(product, variant, mainPath);
          method = "METADATA_BASED_AI";
          source = "metadata_studio_render";
          reference = buildMasterPromptDescription(product, variant);
          manualReview = true;
        }
      } else {
        method = isOpenAiImageAvailable() ? "REFERENCE_BASED_AI" : "METADATA_BASED_AI";
        source = "dry_run_would_generate";
        manualReview = true;
      }
    } else {
      error = "no_source_no_generation";
      manualReview = true;
    }

    if (apply && method !== "FAILED" && fs.existsSync(mainPath)) {
      const v = await validateMainImage(mainPath);
      if (!v.ok) {
        error = v.reason;
        method = "FAILED";
      } else {
        applied = true;
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    method = "FAILED";
    manualReview = true;
  }

  return {
    slug: product.slug,
    sku: variant.sku,
    titleAr: product.nameAr,
    titleEn: product.nameEn,
    category: product.primaryCategory,
    imagePath: applied ? imagePath : fs.existsSync(mainPath) ? imagePath : null,
    method,
    confidence: method === "EXACT_SOURCE" ? "high" : method === "FAILED" ? "low" : "medium",
    source,
    reference: reference ? String(reference).slice(0, 500) : null,
    manualReview,
    error,
    applied,
    galleryUrls: applied ? [imagePath] : null,
  };
}

function applyToCatalog(products, resultsBySlug) {
  for (const product of products) {
    const row = resultsBySlug.get(product.slug);
    if (!row?.applied || !row.galleryUrls?.length) continue;
    product.galleryImages = row.galleryUrls;
    for (const v of product.variants ?? []) {
      v.imageUrl = row.galleryUrls[0];
    }
  }
}

async function consistencyPass(products, resultsBySlug) {
  let outliers = 0;
  for (const product of products) {
    const row = resultsBySlug.get(product.slug);
    if (!row?.applied) continue;
    const slugDir = slugToDir(product.slug);
    const mainPath = path.join(publicRoot, slugDir, "main.webp");
    if (!fs.existsSync(mainPath)) continue;
    const meta = await import("sharp").then((m) => m.default(mainPath).metadata());
    if (meta.width !== CATALOG_CANVAS || meta.height !== CATALOG_CANVAS) {
      outliers++;
      await normalizeSourceToMain(mainPath, mainPath);
    }
  }
  return { outliersFixed: outliers };
}

async function main() {
  const products = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const batch =
    typeof limit === "number" && Number.isFinite(limit) ? products.slice(0, limit) : products;

  const ctx = {
    sourceFiles: scanSourceDirectory(sourcesRoot),
    manifestMap: loadManifest(manifestPath),
  };

  console.log(`Processing ${batch.length} / ${products.length} products…`);
  const results = [];
  for (let i = 0; i < batch.length; i++) {
    results.push(await processProduct(batch[i], ctx));
    if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${batch.length}`);
  }

  const resultsBySlug = new Map(results.map((r) => [r.slug, r]));

  let consistency = { outliersFixed: 0 };
  if (apply && !skipNormalizePass) {
    consistency = await consistencyPass(products, resultsBySlug);
  }

  const withMain = results.filter((r) => r.applied || (r.imagePath && fs.existsSync(path.join(root, "public", r.imagePath.replace(/^\//, "")))));
  const exact = results.filter((r) => r.method === "EXACT_SOURCE" && r.applied).length;
  const refAi = results.filter((r) => r.method === "REFERENCE_BASED_AI" && r.applied).length;
  const metaAi = results.filter((r) => r.method === "METADATA_BASED_AI" && r.applied).length;
  const missing = results.filter((r) => !r.applied && !r.imagePath).length;
  const broken = results.filter((r) => r.error && r.method === "FAILED").length;

  const summary = {
    generatedAt: new Date().toISOString(),
    mode: apply ? "apply" : "dry-run",
    allowGenerated,
    openAiConfigured: isOpenAiImageAvailable(),
    limit: batch.length,
    totalCatalog: products.length,
    totalProducts: products.length,
    productsWithMainImage: results.filter((r) => r.applied).length,
    exactSourceImages: exact,
    referenceBasedAi: refAi,
    metadataBasedAi: metaAi,
    missingImages: missing,
    brokenImages: broken,
    manualReviewQueue: results.filter((r) => r.manualReview && r.method !== "FAILED").length,
    consistencyPass: consistency,
    canvas: CATALOG_CANVAS,
  };

  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const reviewQueue = results.filter((r) => r.manualReview && r.method !== "FAILED");
  const failures = results.filter((r) => r.method === "FAILED" || r.error);
  const sourcesReport = results.map((r) => ({
    sku: r.sku,
    title: r.titleAr ?? r.titleEn,
    category: r.category,
    imagePath: r.imagePath,
    method: r.method,
    source: r.source,
    reference: r.reference,
    confidence: r.confidence,
  }));

  fs.writeFileSync(path.join(reportsDir, "product-image-pipeline-summary.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(reportsDir, "product-image-review-queue.json"), JSON.stringify(reviewQueue, null, 2));
  fs.writeFileSync(path.join(reportsDir, "product-image-failures.json"), JSON.stringify(failures, null, 2));
  fs.writeFileSync(path.join(reportsDir, "product-image-sources.json"), JSON.stringify(sourcesReport, null, 2));

  if (apply) {
    applyToCatalog(products, resultsBySlug);
    fs.writeFileSync(catalogPath, JSON.stringify(products, null, 2));
  }

  await fs.promises.rm(tmpGenDir, { recursive: true, force: true }).catch(() => {});

  console.log("\nPRODUCT IMAGE PIPELINE (main-only)");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
