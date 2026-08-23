import { ALLOWED_IMAGE_MIMES, MAX_IMAGE_BYTES } from "./types";

export type ImageValidationResult =
  | { valid: true; mime: string }
  | { valid: false; code: "too_large" | "invalid_type" | "empty" };

const MAGIC: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

export function validateImageBuffer(buffer: Buffer, declaredMime?: string): ImageValidationResult {
  if (!buffer.length) return { valid: false, code: "empty" };
  if (buffer.length > MAX_IMAGE_BYTES) return { valid: false, code: "too_large" };

  const detected = detectMimeFromMagic(buffer);
  if (!detected || !ALLOWED_IMAGE_MIMES.includes(detected as (typeof ALLOWED_IMAGE_MIMES)[number])) {
    return { valid: false, code: "invalid_type" };
  }

  if (declaredMime && declaredMime !== detected && !(declaredMime === "image/webp" && detected === "image/webp")) {
    return { valid: false, code: "invalid_type" };
  }

  return { valid: true, mime: detected };
}

function detectMimeFromMagic(buffer: Buffer): string | null {
  for (const sig of MAGIC) {
    if (sig.bytes.every((b, i) => buffer[i] === b)) {
      if (sig.mime === "image/webp") {
        const webp = buffer.subarray(8, 12).toString("ascii");
        return webp === "WEBP" ? "image/webp" : null;
      }
      return sig.mime;
    }
  }
  return null;
}

export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
