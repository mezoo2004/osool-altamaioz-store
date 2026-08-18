import { NextResponse } from "next/server";
import { generateDemoAssistantReply } from "@/lib/assistant/assistant-engine";
import type { AssistantRequest } from "@/lib/assistant/assistant-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AssistantRequest;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const locale = body.locale === "en" ? "en" : "ar";

    // Future: integrate OPENAI_API_KEY or similar when available
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey) {
      // Placeholder for production AI — demo fallback until integration is configured
    }

    const result = generateDemoAssistantReply({ ...body, message, locale });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
  }
}
