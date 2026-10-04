#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { CATALOG_CANVAS, CATALOG_BG } from "./lib/product-image-pipeline/normalize.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(root, "data", "catalog", "products.json");

const products = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

async function main() {
let withGallery = 0;
let withMainOnly = 0;
let broken = 0;
let wrongSize = 0;
let bgOutliers = 0;

for (const p of products) {
  const urls = p.galleryImages?.length
    ? p.galleryImages
    : [...new Set(p.variants?.map((v) => v.imageUrl).filter(Boolean) ?? [])];
  if (!urls.length) continue;
  withGallery++;
  if (urls.length === 1) withMainOnly++;
  for (const url of urls) {
    if (!url.startsWith("/product-images/")) continue;
    const disk = path.join(root, "public", url.replace(/^\//, "").replace(/\//g, path.sep));
    if (!fs.existsSync(disk)) {
      broken++;
      continue;
    }
    try {
      const meta = await sharp(disk).metadata();
      if (meta.width !== CATALOG_CANVAS || meta.height !== CATALOG_CANVAS) wrongSize++;
      const corner = await sharp(disk).extract({ left: 8, top: 8, width: 24, height: 24 }).stats();
      const r = corner.channels[0]?.mean ?? 0;
      const g = corner.channels[1]?.mean ?? 0;
      const b = corner.channels[2]?.mean ?? 0;
      if (
        Math.abs(r - CATALOG_BG.r) > 18 ||
        Math.abs(g - CATALOG_BG.g) > 18 ||
        Math.abs(b - CATALOG_BG.b) > 18
      ) {
        bgOutliers++;
      }
    } catch {
      broken++;
    }
  }
}

const report = {
  withGallery,
  withMainOnly,
  brokenUrls: broken,
  wrongCanvasSize: wrongSize,
  backgroundOutliers: bgOutliers,
  total: products.length,
};
console.log(JSON.stringify(report, null, 2));
process.exit(broken > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
