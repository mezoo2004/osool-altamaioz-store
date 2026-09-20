import sharp from "sharp";
import path from "path";
import fs from "fs";

const ext = "C:/Projects/osool-altamaioz-store/public/brand/logo/_extracted";
const out = "C:/Projects/osool-altamaioz-store/public/brand/logo";

async function logoBackgroundToTransparent(input, output) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(data);
  for (let i = 0; i < buf.length; i += 4) {
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    const isWhite = r > 235 && g > 235 && b > 235;
    const isDarkBg = r < 40 && g < 40 && b < 40;
    if (isWhite || isDarkBg) {
      buf[i + 3] = 0;
    }
  }
  await sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(output);
}

async function blackBackdropToTransparent(input, output) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(data);
  for (let i = 0; i < buf.length; i += 4) {
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    if (r < 35 && g < 35 && b < 35) {
      buf[i + 3] = 0;
    }
  }
  await sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(output);
}

async function toLight(input, output) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(data);
  for (let i = 0; i < buf.length; i += 4) {
    const a = buf[i + 3];
    if (a === 0) continue;
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    const isOrange = r > 170 && g > 50 && g < 170 && b < 100;
    if (!isOrange) {
      buf[i] = 255;
      buf[i + 1] = 255;
      buf[i + 2] = 255;
    }
  }
  await sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(output);
}

if (!fs.existsSync(ext)) {
  console.error("Missing _extracted; run extract-brand-assets.mjs first.");
  process.exit(1);
}

const arTmp = path.join(out, "_ar-tmp.png");
const markTmp = path.join(out, "_mark-tmp.png");

await sharp(path.join(ext, "preview-3.png"))
  .extract({ left: 595, top: 120, width: 160, height: 110 })
  .trim({ threshold: 12 })
  .png()
  .toFile(arTmp);

await sharp(path.join(ext, "preview-6.png"))
  .extract({ left: 14, top: 14, width: 68, height: 68 })
  .trim({ threshold: 8 })
  .png()
  .toFile(markTmp);

await logoBackgroundToTransparent(arTmp, path.join(out, "osool-logo-ar-dark.png"));
await blackBackdropToTransparent(markTmp, path.join(out, "osool-mark-dark.png"));
await toLight(path.join(out, "osool-logo-ar-dark.png"), path.join(out, "osool-logo-ar-light.png"));
await toLight(path.join(out, "osool-mark-dark.png"), path.join(out, "osool-mark-light.png"));

for (const s of [16, 32, 48, 180]) {
  await sharp(path.join(out, "osool-mark-dark.png"))
    .resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(out, `favicon-${s}.png`));
}

await sharp(path.join(out, "favicon-32.png")).toFile("C:/Projects/osool-altamaioz-store/src/app/icon.png");
await sharp(path.join(out, "favicon-180.png")).toFile("C:/Projects/osool-altamaioz-store/src/app/apple-icon.png");

fs.unlinkSync(arTmp);
fs.unlinkSync(markTmp);
fs.rmSync(path.join(out, "_tests"), { recursive: true, force: true });
fs.rmSync(ext, { recursive: true, force: true });
console.log("brand assets ok");
