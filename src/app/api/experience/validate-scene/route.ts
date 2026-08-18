import { NextResponse } from "next/server";
import { validateSceneBundle } from "@/lib/experience/scene-bundle-service";
import type { SceneItemRecord } from "@/lib/experience/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { items?: SceneItemRecord[] };
    if (!body.items?.length) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }

    const validation = await validateSceneBundle(body.items);
    return NextResponse.json(validation);
  } catch {
    return NextResponse.json({ error: "validation_failed" }, { status: 500 });
  }
}
