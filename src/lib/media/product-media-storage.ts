import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

export type StoredProductImage = {
  publicUrl: string;
  absolutePath: string;
};

/** Local filesystem storage — swap implementation for S3/R2 in production. */
export async function storeProductMainImage(input: {
  slug: string;
  file: File;
}): Promise<StoredProductImage> {
  if (!ALLOWED_MIME.has(input.file.type)) {
    throw new Error("unsupported_image_type");
  }
  if (input.file.size > MAX_BYTES) {
    throw new Error("image_too_large");
  }

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "product-images", input.slug);
  await fs.mkdir(dir, { recursive: true });
  const absolutePath = path.join(dir, "main.webp");
  await sharp(buffer)
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(absolutePath);

  return {
    publicUrl: `/product-images/${input.slug}/main.webp`,
    absolutePath,
  };
}

export async function storePromotionImage(input: {
  promotionId: string;
  file: File;
}): Promise<StoredProductImage> {
  if (!ALLOWED_MIME.has(input.file.type)) {
    throw new Error("unsupported_image_type");
  }
  if (input.file.size > MAX_BYTES) {
    throw new Error("image_too_large");
  }

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", "promotions");
  await fs.mkdir(dir, { recursive: true });
  const filename = `${input.promotionId}-${Date.now()}.webp`;
  const absolutePath = path.join(dir, filename);
  await sharp(buffer)
    .rotate()
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(absolutePath);

  return {
    publicUrl: `/uploads/promotions/${filename}`,
    absolutePath,
  };
}
