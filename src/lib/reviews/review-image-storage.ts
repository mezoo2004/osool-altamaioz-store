import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ALLOWED_IMAGE_MIMES, MAX_IMAGE_BYTES } from "@/lib/visual-search/types";

const UPLOAD_DIR = path.join(process.cwd(), "data", "reviews", "uploads");

export type ReviewImageUploadResult =
  | { ok: true; storageKey: string; devPath: string }
  | { ok: false; error: "invalid_type" | "too_large" | "write_failed" };

/** Development-only filesystem storage. Production requires object storage/CDN. */
export function storeReviewImageDev(buffer: Buffer, mime: string): ReviewImageUploadResult {
  if (!ALLOWED_IMAGE_MIMES.includes(mime as (typeof ALLOWED_IMAGE_MIMES)[number])) {
    return { ok: false, error: "invalid_type" };
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    return { ok: false, error: "too_large" };
  }

  const ext =
    mime === "image/jpeg"
      ? "jpg"
      : mime === "image/png"
        ? "png"
        : mime === "image/webp"
          ? "webp"
          : "bin";

  const storageKey = `${randomUUID()}.${ext}`;
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const devPath = path.join(UPLOAD_DIR, storageKey);

  try {
    fs.writeFileSync(devPath, buffer);
    return { ok: true, storageKey, devPath };
  } catch {
    return { ok: false, error: "write_failed" };
  }
}

export function resolveDevReviewImageUrl(storageKey: string | null | undefined): string | null {
  if (!storageKey) return null;
  return `/api/reviews/media/${encodeURIComponent(storageKey)}`;
}
