import fs from "node:fs";
import path from "node:path";
import { scoreFilenameMatch } from "./keys.mjs";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export function loadManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) return new Map();
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const map = new Map();
  for (const row of raw.mappings ?? []) {
    if (row.sku && row.file) map.set(String(row.sku).toLowerCase(), row.file);
  }
  return map;
}

export function scanSourceDirectory(rootDir) {
  const files = [];
  if (!fs.existsSync(rootDir)) return files;

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
        files.push(full);
      }
    }
  }
  walk(rootDir);
  return files;
}

export function findBestSourceCandidate({ product, variant, sourceFiles, manifestMap, matchKeys }) {
  const skuKey = variant.sku?.toLowerCase();
  if (skuKey && manifestMap.has(skuKey)) {
    const rel = manifestMap.get(skuKey);
    const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
    if (fs.existsSync(abs)) {
      return { path: abs, confidence: "EXACT", source: "manifest", score: 100 };
    }
  }

  let best = null;
  for (const file of sourceFiles) {
    const { score, reason } = scoreFilenameMatch(path.basename(file), matchKeys);
    if (score >= 100) {
      return { path: file, confidence: "EXACT", source: reason, score };
    }
    if (score >= 85 && (!best || score > best.score)) {
      best = { path: file, confidence: "HIGH_CONFIDENCE", source: reason, score };
    }
  }

  if (variant.imageUrl && /^https?:\/\//i.test(variant.imageUrl)) {
    return {
      url: variant.imageUrl,
      confidence: "HIGH_CONFIDENCE",
      source: "catalog_url",
      score: 80,
    };
  }

  if (best) return best;
  return null;
}
