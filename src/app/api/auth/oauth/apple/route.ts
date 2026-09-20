import { NextResponse } from "next/server";
import { buildAppleAuthUrl } from "@/lib/auth/apple-oauth";
import { isAppleOAuthConfigured } from "@/lib/auth/oauth-config";
import { createOAuthState } from "@/lib/auth/oauth-state";

export async function GET(request: Request) {
  if (!isAppleOAuthConfigured()) {
    return NextResponse.json({ error: "apple_oauth_not_configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "ar";
  const state = await createOAuthState("apple", locale);
  const url = buildAppleAuthUrl(state);
  return NextResponse.redirect(url);
}
