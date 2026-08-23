import { NextResponse } from "next/server";
import { generateAssistantReply } from "@/lib/assistant/assistant-engine";
import { polishReplyWithAi } from "@/lib/assistant/assistant-provider";
import type { AssistantRequest } from "@/lib/assistant/assistant-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AssistantRequest;
    const message = body.message?.trim();
    const hasVisualUpload = Boolean(body.visualSearchResult);

    if (!message && !hasVisualUpload) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const locale = body.locale === "en" ? "en" : "ar";
    const demoResult = await generateAssistantReply({
      ...body,
      message: message || (locale === "ar" ? "أبي شيء يشبه هذا" : "I want something like this"),
      locale,
    });

    const advisoryNote =
      locale === "ar"
        ? "التوصيات إرشادية وليست حسابات هندسية معتمدة."
        : "Recommendations are advisory, not certified engineering calculations.";

    const polished = await polishReplyWithAi(demoResult, {
      locale,
      space: demoResult.state?.currentSpace,
      designerSummary: demoResult.state?.lastRecommendation,
      advisoryNote,
    });

    return NextResponse.json(polished ?? demoResult);
  } catch {
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
  }
}
