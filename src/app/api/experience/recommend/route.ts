import { NextResponse } from "next/server";
import { lightingRecommendationService } from "@/lib/experience/lighting-recommendation-service";
import type { CctChoice, MoodId, WallColorTone } from "@/lib/experience/types";

const WALL_COLORS: WallColorTone[] = [
  "very_light",
  "beige",
  "light_gray",
  "dark_gray",
  "warm_tones",
  "unsure",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      spaceSlug?: string;
      length?: number;
      width?: number;
      height?: number;
      mood?: MoodId;
      cct?: CctChoice;
      wallColor?: WallColorTone;
    };

    const wallColor =
      body.wallColor && WALL_COLORS.includes(body.wallColor) ? body.wallColor : "unsure";

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
      wallColor,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "recommendation_failed" }, { status: 500 });
  }
}
