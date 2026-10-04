import fs from "node:fs";
import path from "node:path";
import { wrapMasterPrompt, buildMasterPromptDescription } from "./description.mjs";

export function isGeminiImageAvailable() {
  return Boolean(
    process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_GENAI_API_KEY?.trim() ||
      process.env.GOOGLE_API_KEY?.trim(),
  );
}

function geminiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENAI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim()
  );
}

function imageModelId() {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-3.1-flash-image";
}

function sanitizeError(err) {
  const msg = err instanceof Error ? err.message : String(err);
  return msg
    .replace(/AIza[\w-]+/gi, "[REDACTED]")
    .replace(/AQ\.[\w-]+/gi, "[REDACTED]")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]");
}

async function writeRasterFromInteractions(interaction, outPath) {
  for (const output of interaction.outputs ?? []) {
    if (output.type === "image" && output.data) {
      await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
      await fs.promises.writeFile(outPath, Buffer.from(output.data, "base64"));
      return outPath;
    }
  }
  if (interaction.output_image?.data) {
    await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
    await fs.promises.writeFile(outPath, Buffer.from(interaction.output_image.data, "base64"));
    return outPath;
  }
  throw new Error("no image in Gemini interaction response");
}

async function generateViaInteractions(prompt, outPath) {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: geminiKey() });
  const interaction = await ai.interactions.create({
    model: imageModelId(),
    input: prompt,
    response_modalities: ["image"],
  });
  return writeRasterFromInteractions(interaction, outPath);
}

async function generateViaLegacySdk(prompt, outPath) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(geminiKey());
  const model = genAI.getGenerativeModel({ model: imageModelId() });
  const result = await model.generateContent(prompt);
  const parts = result.response?.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData;
    if (inline?.mimeType?.startsWith("image/") && inline.data) {
      await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
      await fs.promises.writeFile(outPath, Buffer.from(inline.data, "base64"));
      return outPath;
    }
  }
  throw new Error("no image in legacy Gemini response");
}

async function generateRaster(prompt, outPath) {
  try {
    return await generateViaInteractions(prompt, outPath);
  } catch (e) {
    const msg = sanitizeError(e);
    if (/429|rate|quota|limit:\s*0/i.test(msg)) throw new Error(msg);
    return generateViaLegacySdk(prompt, outPath);
  }
}

export async function generateGeminiTestRaster(tmpDir) {
  if (!geminiKey()) throw new Error("GEMINI_API_KEY not configured");
  await fs.promises.mkdir(tmpDir, { recursive: true });
  const out = path.join(tmpDir, "key-validate-test.png");
  const prompt =
    "Premium studio ecommerce product photography of a white electrical switch plate, " +
    "centered on clean off-white background #f5f4f1, photorealistic, no text, no watermark.";
  try {
    return await generateRaster(prompt, out);
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function generateGeminiMain(product, variant, tmpDir) {
  if (!geminiKey()) return null;
  await fs.promises.mkdir(tmpDir, { recursive: true });
  const out = path.join(tmpDir, `${product.slug.slice(0, 72)}.png`);
  const prompt = wrapMasterPrompt(buildMasterPromptDescription(product, variant));
  return generateRaster(prompt, out);
}
