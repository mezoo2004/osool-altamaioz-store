/**
 * Crop the 4 mark variants from the official logo reference sheet (2×2 grid).
 * Usage: node scripts/extract-logo-mark-sheet.mjs [path-to-sheet.png]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const defaultSheet = path.join(process.cwd(), "references/brand/logo-mark-sheet.png");
const sheetPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultSheet;
const outDir = path.join(process.cwd(), "public/brand/logo");

if (!fs.existsSync(sheetPath)) {
  console.error("Sheet not found:", sheetPath);
  process.exit(1);
}

const meta = await sharp(sheetPath).metadata();
const w = meta.width;
const h = meta.height;
const halfW = Math.floor(w / 2);
const halfH = Math.floor(h / 2);
const pad = 20;

/** Sheet layout: TL dark, TR orange, BL white, BR light gray. */
const cells = [
  { name: "osool-mark-dark", left: pad, top: pad, width: halfW - pad * 2, height: halfH - pad * 2 },
  { name: "osool-mark-on-orange", left: halfW + pad, top: pad, width: halfW - pad * 2, height: halfH - pad * 2 },
  { name: "osool-mark-light", left: pad, top: halfH + pad, width: halfW - pad * 2, height: halfH - pad * 2 },
  { name: "osool-mark-on-gray", left: halfW + pad, top: halfH + pad, width: halfW - pad * 2, height: halfH - pad * 2 },
];

async function removeBackgroundByCorners(inputBuffer, tolerance = 34) {
  const { data, info } = await sharp(inputBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const corners = [
    [2, 2],
    [info.width - 3, 2],
    [2, info.height - 3],
    [info.width - 3, info.height - 3],
  ];
  let sr = 0;
  let sg = 0;
  let sb = 0;
  for (const [x, y] of corners) {
    const i = (y * info.width + x) * 4;
    sr += data[i];
    sg += data[i + 1];
    sb += data[i + 2];
  }
  sr /= corners.length;
  sg /= corners.length;
  sb /= corners.length;

  const buf = Buffer.from(data);
  for (let i = 0; i < buf.length; i += 4) {
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    if (Math.abs(r - sr) <= tolerance && Math.abs(g - sg) <= tolerance && Math.abs(b - sb) <= tolerance) {
      buf[i + 3] = 0;
    }
  }

  return sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 10 })
    .resize(320, 320, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png();
}

fs.mkdirSync(outDir, { recursive: true });

for (const cell of cells) {
  const cropped = await sharp(sheetPath)
    .extract({ left: cell.left, top: cell.top, width: cell.width, height: cell.height })
    .png()
    .toBuffer();

  const outPath = path.join(outDir, `${cell.name}.png`);
  const pipeline = await removeBackgroundByCorners(cropped);
  await pipeline.toFile(outPath);
  console.log("Wrote", outPath);
}

const markDark = path.join(outDir, "osool-mark-dark.png");
const markDarkNorm = path.join(outDir, "osool-mark-dark.normalized.png");
await sharp(markDark)
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(markDarkNorm);
fs.renameSync(markDarkNorm, markDark);

for (const size of [32, 48, 180]) {
  const dest =
    size === 32
      ? path.join(process.cwd(), "src/app/icon.png")
      : size === 180
        ? path.join(process.cwd(), "src/app/apple-icon.png")
        : path.join(outDir, "favicon-48.png");
  await sharp(markDark)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(dest);
}

await sharp(markDark)
  .resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(outDir, "favicon-16.png"));
await sharp(markDark)
  .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(outDir, "favicon-32.png"));

console.log("Favicons updated from osool-mark-dark.png");
