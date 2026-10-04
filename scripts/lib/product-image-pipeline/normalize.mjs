import sharp from "sharp";

/** Osool Altamaioz unified catalog canvas — do not change per product. */
export const CATALOG_CANVAS = 1600;
export const CATALOG_BG = { r: 245, g: 244, b: 241, alpha: 1 };

/** Target product coverage ~70% of canvas (longest edge). */
const PRODUCT_COVER_RATIO = 0.72;

/**
 * Normalize any main image to the unified Osool studio template:
 * square canvas, fixed background, centered product, soft shadow, WebP.
 */
export async function normalizeCatalogMain(input, outputPath) {
  const productBuf = await sharp(input)
    .trim()
    .resize(Math.round(CATALOG_CANVAS * PRODUCT_COVER_RATIO), Math.round(CATALOG_CANVAS * PRODUCT_COVER_RATIO), {
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  const meta = await sharp(productBuf).metadata();
  const pw = meta.width ?? 800;
  const ph = meta.height ?? 800;
  const left = Math.round((CATALOG_CANVAS - pw) / 2);
  const top = Math.round((CATALOG_CANVAS - ph) / 2 - CATALOG_CANVAS * 0.02);

  const shadowSvg = Buffer.from(
    `<svg width="${CATALOG_CANVAS}" height="${CATALOG_CANVAS}" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="${CATALOG_CANVAS / 2}" cy="${Math.min(CATALOG_CANVAS - 40, top + ph + 28)}" rx="${Math.round(pw * 0.42)}" ry="${Math.round(ph * 0.06)}" fill="#000" opacity="0.09"/>
    </svg>`,
  );

  const shadow = await sharp(shadowSvg).png().toBuffer();

  await sharp({
    create: {
      width: CATALOG_CANVAS,
      height: CATALOG_CANVAS,
      channels: 4,
      background: CATALOG_BG,
    },
  })
    .composite([
      { input: shadow, top: 0, left: 0 },
      { input: productBuf, top: Math.max(0, top), left: Math.max(0, left) },
    ])
    .webp({ quality: 86, effort: 4 })
    .toFile(outputPath);
}

export async function validateMainImage(filePath) {
  const meta = await sharp(filePath).metadata();
  if (!meta.width || !meta.height) return { ok: false, reason: "undecodable" };
  if (meta.width < 800 || meta.height < 800) return { ok: false, reason: "too_small" };
  const stats = await sharp(filePath).stats();
  const avg =
    stats.channels.reduce((s, c) => s + (c.mean ?? 0), 0) / Math.max(1, stats.channels.length);
  if (avg > 252) return { ok: false, reason: "empty_bright" };
  return { ok: true };
}
