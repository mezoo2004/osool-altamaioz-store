import type { VisualAttributes, VisualProductType } from "./types";

export type VisionAnalysis = {
  attributes: VisualAttributes;
  confidence: "high" | "medium" | "low";
};

const TYPE_MAP: Record<string, VisualProductType> = {
  chandelier: "chandelier",
  pendant: "pendant",
  spotlight: "spotlight",
  downlight: "spotlight",
  cob: "spotlight",
  track: "track",
  panel: "panel",
  strip: "strip",
  profile: "profile",
  flood: "floodlight",
  floodlight: "floodlight",
  switch: "switch",
  نجف: "chandelier",
  نجفة: "chandelier",
  سبوت: "spotlight",
  معلقة: "pendant",
  تراك: "track",
  بانل: "panel",
};

export async function analyzeImageWithVision(options: {
  imageBuffer: Buffer;
  mime: string;
  locale: "ar" | "en";
  query?: string;
}): Promise<VisionAnalysis | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const base64 = options.imageBuffer.toString("base64");
  const dataUrl = `data:${options.mime};base64,${base64}`;

  const systemPrompt =
    options.locale === "ar"
      ? "حلّل صورة منتج إضاءة. أعد JSON فقط: { productType, color, style, finish, keywords[] }. productType واحد من: chandelier, spotlight, pendant, track, panel, strip, profile, floodlight, switch, unknown. لا تخترع ماركات."
      : "Analyze a lighting product image. Return JSON only: { productType, color, style, finish, keywords[] }. productType one of: chandelier, spotlight, pendant, track, panel, strip, profile, floodlight, switch, unknown. Do not invent brands.";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: options.query?.trim() || "Identify lighting product type, color, and style.",
              },
              { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const productType = normalizeType(String(parsed.productType ?? "unknown"));
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords.map(String).slice(0, 8)
      : [];

    return {
      attributes: {
        productType,
        color: parsed.color ? String(parsed.color) : undefined,
        style: parsed.style ? String(parsed.style) : undefined,
        finish: parsed.finish ? String(parsed.finish) : undefined,
        keywords,
      },
      confidence: productType === "unknown" ? "low" : "medium",
    };
  } catch {
    return null;
  }
}

function normalizeType(value: string): VisualProductType {
  const key = value.toLowerCase().trim();
  return TYPE_MAP[key] ?? (key as VisualProductType) ?? "unknown";
}
