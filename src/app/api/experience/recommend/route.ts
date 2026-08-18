import { NextResponse } from "next/server";
import { lightingRecommendationService } from "@/lib/experience/lighting-recommendation-service";
import type { CctChoice, MoodId } from "@/lib/experience/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      spaceSlug?: string;
      length?: number;
      width?: number;
      height?: number;
      mood?: MoodId;
      cct?: CctChoice;
    };

    if (
      !body.spaceSlug ||
      !body.mood ||
      !body.cct ||
      typeof body.length !== "number" ||
      typeof body.width !== "number" ||
      typeof body.height !== "number"
    ) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    const result = await lightingRecommendationService.recommend({
      spaceSlug: body.spaceSlug,
      length: body.length,
      width: body.width,
      height: body.height,
      mood: body.mood,
      cct: body.cct,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "recommendation_failed" }, { status: 500 });
  }
}
