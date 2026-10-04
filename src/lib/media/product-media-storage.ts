import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

export type StoredProductImage = {
  publicUrl: string;
  absolutePath: string;
};

function normalizeMime(type: string, filename?: string): string {
  const t = type.toLowerCase();
  if (ALLOWED_MIME.has(t)) return t;
  if (filename?.toLowerCase().endsWith(".jpg") || filename?.toLowerCase().endsWith(".jpeg")) {
    return "image/jpeg";
  }
  return t;
}

async function validateImageBuffer(buffer: Buffer): Promise<void> {
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height) {
    throw new Error("invalid_image");
  }
}

/** Local filesystem storage — swap implementation for S3/R2 in production. */
export async function storeProductMainImage(input: {
  slug: string;
  file: File;
}): Promise<StoredProductImage> {
  const mime = normalizeMime(input.file.type, input.file.name);
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error("unsupported_image_type");
  }
  if (input.file.size > MAX_BYTES) {
    throw new Error("image_too_large");
  }

  const buffer = Buffer.from(await input.file.arrayBuffer());
  await validateImageBuffer(buffer);

  const dir = path.join(process.cwd(), "public", "product-images", input.slug);
  await fs.mkdir(dir, { recursive: true });
  const absolutePath = path.join(dir, "main.webp");
  const tempPath = path.join(dir, "main.webp.uploading");

  await sharp(buffer)
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true, background: { r: 245, g: 245, b: 243, alpha: 1 } })
    .webp({ quality: 82 })
    .toFile(tempPath);

  await fs.rename(tempPath, absolutePath);

  const version = Date.now();
  return {
    publicUrl: `/product-images/${input.slug}/main.webp?v=${version}`,
    absolutePath,
  };
}

export async function storePromotionImage(input: {
  promotionId: string;
  file: File;
  slot?: "desktop" | "mobile" | "background";
}): Promise<StoredProductImage> {
  const mime = normalizeMime(input.file.type, input.file.name);
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error("unsupported_image_type");
  }
  if (input.file.size > MAX_BYTES) {
    throw new Error("image_too_large");
  }

  const buffer = Buffer.from(await input.file.arrayBuffer());
  await validateImageBuffer(buffer);

  const dir = path.join(process.cwd(), "public", "uploads", "promotions");
  await fs.mkdir(dir, { recursive: true });
  const slot = input.slot ?? "desktop";
  const filename = `${input.promotionId}-${slot}-${Date.now()}.webp`;
  const absolutePath = path.join(dir, filename);
  await sharp(buffer)
    .rotate()
    .resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(absolutePath);

  return {
    publicUrl: `/uploads/promotions/${filename}`,
    absolutePath,
  };
}
