import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { wrapMasterPrompt, buildMasterPromptDescription } from "./description.mjs";

function seedFromSlug(slug) {
  const h = crypto.createHash("sha256").update(slug).digest();
  return h.readUInt32BE(0) % 2_000_000_000;
}

function buildPrompt(product, variant) {
  return wrapMasterPrompt(buildMasterPromptDescription(product, variant));
}

function pollinationsUrl(prompt, seed) {
  const encoded = encodeURIComponent(prompt);
  const model = process.env.POLLINATIONS_IMAGE_MODEL?.trim() || "black-forest-labs/flux.1-schnell";
  return `https://gen.pollinations.ai/image/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}&model=${encodeURIComponent(model)}`;
}

function pollinationsHeaders() {
  const key = process.env.POLLINATIONS_API_KEY?.trim();
  return key ? { Authorization: `Bearer ${key}` } : {};
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch a raster AI image (JPEG/PNG) from Pollinations Flux.
 * Returns path to temp file on disk.
 */
export async function fetchAiProductRaster(product, variant, tmpDir, attempt = 1) {
  const prompt = buildPrompt(product, variant);
  const seed = seedFromSlug(product.slug);
  const url = pollinationsUrl(prompt, seed);

  await fs.promises.mkdir(tmpDir, { recursive: true });
  const out = path.join(tmpDir, `${product.slug.slice(0, 72)}.jpg`);

  const res = await fetch(url, {
    signal: AbortSignal.timeout(180_000),
    headers: {
      "User-Agent": "OsoolAltamaioz-ProductImagePipeline/1.0",
      ...pollinationsHeaders(),
    },
  });

  if (!res.ok) {
    if (attempt < 4) {
      await sleep(1500 * attempt);
      return fetchAiProductRaster(product, variant, tmpDir, attempt + 1);
    }
    throw new Error(`AI fetch HTTP ${res.status}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) {
    if (attempt < 4) {
      await sleep(1500 * attempt);
      return fetchAiProductRaster(product, variant, tmpDir, attempt + 1);
    }
    throw new Error("AI fetch returned empty or tiny payload");
  }

  await fs.promises.writeFile(out, buf);
  return out;
}
