import fs from "node:fs";
import path from "node:path";
import { wrapMasterPrompt, buildMasterPromptDescription } from "./description.mjs";

export function isOpenAiImageAvailable() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/**
 * Optional photoreal generation when OPENAI_API_KEY is configured locally.
 * Returns path to temp PNG or null on skip/failure.
 */
export async function generateOpenAiMain(product, variant, tmpDir) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const desc = buildMasterPromptDescription(product, variant);
  const prompt = wrapMasterPrompt(desc);

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "high",
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) return null;

  await fs.promises.mkdir(tmpDir, { recursive: true });
  const out = path.join(tmpDir, `gen-${product.slug.slice(0, 40)}.png`);
  await fs.promises.writeFile(out, Buffer.from(b64, "base64"));
  return out;
}
