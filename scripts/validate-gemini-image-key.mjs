#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvLocal } from "./lib/product-image-pipeline/env.mjs";
import { isGeminiImageAvailable, generateGeminiTestRaster } from "./lib/product-image-pipeline/gemini-image.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvLocal(root);

async function main() {
  if (!isGeminiImageAvailable()) {
    console.log(JSON.stringify({ valid: false, provider: "google-gemini", error: "GEMINI_API_KEY not set" }));
    process.exit(2);
  }
  const tmpDir = path.join(root, "data", "reports", ".key-validate-tmp");
  try {
    const out = await generateGeminiTestRaster(tmpDir);
    const stat = fs.statSync(out);
    const ok = stat.size > 8000;
    await fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    console.log(
      JSON.stringify({
        valid: ok,
        provider: "google-gemini",
        bytes: ok ? stat.size : 0,
        error: ok ? null : "response too small or not a raster image",
      }),
    );
    process.exit(ok ? 0 : 3);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const safe = msg.replace(/AIza[\w-]+/gi, "[REDACTED]").replace(/AQ\.[\w-]+/gi, "[REDACTED]");
    console.log(JSON.stringify({ valid: false, provider: "google-gemini", error: safe }));
    process.exit(3);
  }
}

main();
