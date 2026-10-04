import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { CATALOG_CANVAS, normalizeCatalogMain } from "./normalize.mjs";

const RENDER_SIZE = CATALOG_CANVAS;

function finishColor(finish) {
  const f = String(finish ?? "").toLowerCase();
  if (/wh|white|ابيض/.test(f)) return { base: "#ececea", edge: "#d8d8d4", spec: "#ffffff" };
  if (/bk|black|اسود/.test(f)) return { base: "#1f1f1f", edge: "#0a0a0a", spec: "#444444" };
  if (/gy|gray|grey|رمادي/.test(f)) return { base: "#8b9199", edge: "#6b7280", spec: "#c4c8cc" };
  if (/gold|gd|ذهب/.test(f)) return { base: "#c9a227", edge: "#9a7b1a", spec: "#e8d48a" };
  if (/chrome|silver|فض/.test(f)) return { base: "#c0c4c8", edge: "#909498", spec: "#f0f2f4" };
  return { base: "#d0d0cc", edge: "#a8a8a4", spec: "#ececea" };
}

export function categoryKind(product) {
  const hay = `${product.primaryCategory} ${product.categorySlugs?.join(" ")} ${product.productType} ${product.nameEn}`.toLowerCase();
  if (/switch|socket|control|مفات|افياش/.test(hay)) return "switch";
  if (/fan|مرو/.test(hay)) return "fan";
  if (/chandelier|pendant|نجف|معلق/.test(hay)) return "pendant";
  if (/strip|led-strips|rope|حبل|profile|بروفا/.test(hay)) return "linear";
  if (/flood|outdoor|كشاف|facade|garden/.test(hay)) return "outdoor";
  if (/track|تراك/.test(hay)) return "track";
  if (/panel|بانل/.test(hay)) return "panel";
  if (/bulb|لمبة|gu10/.test(hay)) return "bulb";
  return "spotlight";
}

function studioSvg(product, variant) {
  const kind = categoryKind(product);
  const { base, edge, spec } = finishColor(variant.finish);
  const bg = "#f5f4f1";

  const grad = (id) =>
    `<defs><linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${spec}"/><stop offset="45%" stop-color="${base}"/><stop offset="100%" stop-color="${edge}"/></linearGradient></defs>`;

  const shapes = {
    spotlight: `${grad("g1")}<ellipse cx="800" cy="1180" rx="420" ry="72" fill="#000" opacity="0.09"/><rect x="620" y="480" width="360" height="96" rx="20" fill="url(#g1)" stroke="${edge}" stroke-width="2"/><circle cx="800" cy="760" r="240" fill="url(#g1)" stroke="${edge}" stroke-width="3"/><circle cx="800" cy="760" r="80" fill="#111" opacity="0.35"/>`,
    pendant: `${grad("g1")}<ellipse cx="800" cy="1240" rx="380" ry="58" fill="#000" opacity="0.09"/><rect x="780" y="220" width="40" height="280" rx="8" fill="#888"/><ellipse cx="800" cy="720" rx="260" ry="180" fill="url(#g1)" stroke="${edge}" stroke-width="3"/>`,
    linear: `${grad("g1")}<ellipse cx="800" cy="1240" rx="500" ry="58" fill="#000" opacity="0.09"/><rect x="240" y="680" width="1120" height="140" rx="32" fill="url(#g1)" stroke="${edge}" stroke-width="3"/>`,
    outdoor: `${grad("g1")}<ellipse cx="800" cy="1260" rx="440" ry="64" fill="#000" opacity="0.09"/><rect x="560" y="640" width="480" height="320" rx="28" fill="url(#g1)" stroke="${edge}"/><rect x="620" y="560" width="360" height="100" rx="12" fill="#333"/>`,
    switch: `${grad("g1")}<ellipse cx="800" cy="1240" rx="340" ry="58" fill="#000" opacity="0.09"/><rect x="480" y="520" width="640" height="440" rx="32" fill="url(#g1)" stroke="${edge}" stroke-width="3"/><rect x="580" y="640" width="160" height="160" rx="12" fill="#fff" opacity="0.25"/>`,
    fan: `${grad("g1")}<ellipse cx="800" cy="1240" rx="400" ry="58" fill="#000" opacity="0.09"/><circle cx="800" cy="760" r="300" fill="none" stroke="url(#g1)" stroke-width="36"/><circle cx="800" cy="760" r="64" fill="url(#g1)"/>`,
    track: `${grad("g1")}<ellipse cx="800" cy="1240" rx="400" ry="58" fill="#000" opacity="0.09"/><rect x="200" y="700" width="1200" height="48" rx="8" fill="#555"/><rect x="680" y="560" width="240" height="200" rx="40" fill="url(#g1)" stroke="${edge}"/>`,
    panel: `${grad("g1")}<ellipse cx="800" cy="1240" rx="420" ry="58" fill="#000" opacity="0.09"/><rect x="360" y="560" width="880" height="560" rx="24" fill="url(#g1)" stroke="${edge}" stroke-width="3"/>`,
    bulb: `${grad("g1")}<ellipse cx="800" cy="1240" rx="280" ry="52" fill="#000" opacity="0.09"/><rect x="720" y="880" width="160" height="120" rx="8" fill="#888"/><path d="M720 880 Q800 520 880 880 Z" fill="url(#g1)" stroke="${edge}" stroke-width="2"/>`,
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${RENDER_SIZE}" height="${RENDER_SIZE}" viewBox="0 0 1600 1600">
  <rect width="100%" height="100%" fill="${bg}"/>
  ${shapes[kind] ?? shapes.spotlight}
</svg>`;
}

export async function renderMetadataStudioToMain(product, variant, outputPath) {
  const svg = studioSvg(product, variant);
  const tmp = outputPath.replace(/\.webp$/i, ".tmp-normalize.png");
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(tmp);
  await normalizeCatalogMain(tmp, outputPath);
  await fs.promises.unlink(tmp).catch(() => {});
}

export async function normalizeSourceToMain(sourcePath, outputPath) {
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await normalizeCatalogMain(sourcePath, outputPath);
}
