import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/data/user-repository";
import { queuePendingReview, listApprovedPublicReviews } from "@/lib/reviews/review-repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "ar";
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Math.min(24, Math.max(1, Number(limitRaw) || 6)) : undefined;

  const reviews = await listApprovedPublicReviews(locale, limit);
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const payload = body as {
    rating?: number;
    text?: string;
    locale?: string;
    productSlug?: string | null;
    imageStorageKey?: string | null;
  };

  const rating = Number(payload.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "invalid_rating" }, { status: 400 });
  }

  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (text.length < 12 || text.length > 2000) {
    return NextResponse.json({ error: "invalid_text" }, { status: 400 });
  }

  const locale = payload.locale === "en" ? "en" : "ar";
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email.split("@")[0] ||
    "Customer";

  const record = queuePendingReview({
    locale,
    displayName,
    customerId: user.id,
    submission: {
      rating,
      body: text,
      productSlug: payload.productSlug ?? null,
      imageStorageKey: payload.imageStorageKey ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    status: record.status,
    message:
      locale === "ar"
        ? "شكرًا — تقييمك بانتظار المراجعة قبل النشر."
        : "Thank you — your review is pending moderation before it goes live.",
  });
}
