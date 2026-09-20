import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/data/user-repository";
import { storeReviewImageDev } from "@/lib/reviews/review-image-storage";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_image" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = storeReviewImageDev(buffer, file.type || "application/octet-stream");

  if (!result.ok) {
    const status = result.error === "too_large" ? 413 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    storageKey: result.storageKey,
    previewUrl: `/api/reviews/media/${encodeURIComponent(result.storageKey)}`,
    storageMode: "development_filesystem",
  });
}
