import { NextRequest, NextResponse } from "next/server";
import { getProductRepository } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const locale = request.nextUrl.searchParams.get("locale") ?? "ar";

  if (!q.trim()) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await getProductRepository().getSuggestions(q, 8);
  return NextResponse.json({ suggestions, locale });
}
