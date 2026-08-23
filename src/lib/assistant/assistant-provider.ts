import type { AssistantLocale, AssistantResponse } from "./assistant-types";

type PolishContext = {
  locale: AssistantLocale;
  space?: string;
  designerSummary?: string;
  advisoryNote: string;
};

export async function polishReplyWithAi(
  demoResponse: AssistantResponse,
  context: PolishContext,
): Promise<AssistantResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const systemPrompt =
      context.locale === "ar"
        ? `أنت مساعد اصول الذكي للإضاءة لمتجر اصول التميز (Osool Altamaioz). أعد صياغة الرد بشكل طبيعي بالعربية السعودية/الخليجية — مهني لكن ودود، بدون مبالغة. لا تغيّر الأرقام أو المنتجات أو الCTA. ${context.advisoryNote}`
        : `You are the Osool Altamaioz smart lighting assistant. Rephrase naturally — professional but friendly. Do not change numbers, products, or CTAs. ${context.advisoryNote}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Rewrite this assistant reply:\n\n${demoResponse.reply}${
              context.designerSummary ? `\n\nGrounding facts:\n${context.designerSummary}` : ""
            }`,
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const polished = data.choices?.[0]?.message?.content?.trim();
    if (!polished) return null;

    return {
      ...demoResponse,
      reply: polished,
      mode: "ai",
    };
  } catch {
    return null;
  }
}
