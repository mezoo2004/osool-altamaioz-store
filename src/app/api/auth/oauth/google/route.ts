import { NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/auth/google-oauth";
import { isGoogleOAuthConfigured } from "@/lib/auth/oauth-config";
import { createOAuthState } from "@/lib/auth/oauth-state";

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json({ error: "google_oauth_not_configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "ar";
  const state = await createOAuthState("google", locale);
  const url = buildGoogleAuthUrl(state);
  return NextResponse.redirect(url);
}
