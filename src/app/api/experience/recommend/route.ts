import { NextResponse } from "next/server";
import { validateRoomDimensions } from "@/lib/experience/lighting-lumen-engine";
import { lightingRecommendationService } from "@/lib/experience/lighting-recommendation-service";
import type {
  BrightnessPreference,
  CctChoice,
  InteriorStyle,
  MoodId,
  NaturalLightLevel,
  WallColorTone,
} from "@/lib/experience/types";

const WALL_COLORS: WallColorTone[] = [
  "very_light",
  "beige",
  "light_gray",
  "dark_gray",
  "warm_tones",
  "unsure",
];

const MOODS: MoodId[] = [
  "warm",
  "luxury",
  "modern",
  "relaxed",
  "minimal",
  "hotel",
  "dramatic",
  "functional",
];

const CCTS: CctChoice[] = ["3000K", "4000K", "6500K"];
const INTERIOR_STYLES: InteriorStyle[] = ["light", "balanced", "dark"];
const NATURAL_LIGHT: NaturalLightLevel[] = ["low", "medium", "high"];
const BRIGHTNESS: BrightnessPreference[] = ["soft", "standard", "bright"];

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
      ceilingColor?: WallColorTone;
      interiorStyle?: InteriorStyle;
      naturalLight?: NaturalLightLevel;
      brightnessPreference?: BrightnessPreference;
    };

    if (
      !body.spaceSlug ||
      !body.mood ||
      !body.cct ||
      typeof body.length !== "number" ||
      typeof body.width !== "number" ||
      typeof body.height !== "number" ||
      !MOODS.includes(body.mood) ||
      !CCTS.includes(body.cct)
    ) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    const validation = validateRoomDimensions(body.length, body.width, body.height);
    if (!validation.valid) {
      return NextResponse.json({ error: "invalid_dimensions", details: validation.errors }, { status: 400 });
    }

    const wallColor =
      body.wallColor && WALL_COLORS.includes(body.wallColor) ? body.wallColor : "unsure";
    const ceilingColor =
      body.ceilingColor && WALL_COLORS.includes(body.ceilingColor) ? body.ceilingColor : undefined;
    const interiorStyle =
      body.interiorStyle && INTERIOR_STYLES.includes(body.interiorStyle)
        ? body.interiorStyle
        : undefined;
    const naturalLight =
      body.naturalLight && NATURAL_LIGHT.includes(body.naturalLight) ? body.naturalLight : undefined;
    const brightnessPreference =
      body.brightnessPreference && BRIGHTNESS.includes(body.brightnessPreference)
        ? body.brightnessPreference
        : undefined;

    const result = await lightingRecommendationService.recommend({
      spaceSlug: body.spaceSlug,
      length: body.length,
      width: body.width,
      height: body.height,
      mood: body.mood,
      cct: body.cct,
      wallColor,
      ceilingColor,
      interiorStyle,
      naturalLight,
      brightnessPreference,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "invalid_dimensions") {
      return NextResponse.json({ error: "invalid_dimensions" }, { status: 400 });
    }
    return NextResponse.json({ error: "recommendation_failed" }, { status: 500 });
  }
}
