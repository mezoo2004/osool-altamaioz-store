#!/usr/bin/env node
/**
 * Ingest GenerateImage outputs from Cursor assets folder → normalized main.webp + catalog.
 *
 * Expects files named `{product-slug}.jpg` or `.png` in CURSOR_ASSETS_DIR.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { slugToDir } from "./lib/product-image-pipeline/keys.mjs";
import { normalizeSourceToMain } from "./lib/product-image-pipeline/render.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "data", "catalog", "products.json");
const publicRoot = path.join(root, "public", "product-images");
const assetsDir =
  process.env.CURSOR_ASSETS_DIR?.trim() ||
  path.join(
    process.env.USERPROFILE || "",
    ".cursor",
    "projects",
    "c-Users-admin-OneDrive-OSOOL-osool-altamaioz-store",
    "assets",
  );

async function main() {
const products = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

let applied = 0;
let missing = 0;

for (const product of products) {
  const candidates = [`${product.slug}.jpg`, `${product.slug}.png`, `${product.slug}.jpeg`];
  let src = null;
  for (const name of candidates) {
    const p = path.join(assetsDir, name);
    if (fs.existsSync(p)) {
      src = p;
      break;
    }
  }
  if (!src) {
    missing++;
    continue;
  }
  const slugDir = slugToDir(product.slug);
  const mainPath = path.join(publicRoot, slugDir, "main.webp");
  await normalizeSourceToMain(src, mainPath);
  const url = `/product-images/${slugDir}/main.webp`;
  product.galleryImages = [url];
  for (const v of product.variants ?? []) v.imageUrl = url;
  applied++;
}

fs.writeFileSync(catalogPath, JSON.stringify(products, null, 2));
console.log(JSON.stringify({ assetsDir, applied, missing, total: products.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
