import { NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/auth/google-oauth";
import { getSiteOrigin, isGoogleOAuthConfigured } from "@/lib/auth/oauth-config";
import { verifyOAuthState } from "@/lib/auth/oauth-state";
import { resolveOAuthSessionUser } from "@/lib/auth/oauth-user-service";
import { createSession } from "@/lib/data/user-repository";

export async function GET(request: Request) {
  const origin = getSiteOrigin();
  const fail = (locale: string, code: string) =>
    NextResponse.redirect(`${origin}/${locale}/login?oauth_error=${encodeURIComponent(code)}`);

  if (!isGoogleOAuthConfigured()) {
    return fail("ar", "not_configured");
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) return fail("ar", "invalid_callback");

  const verified = await verifyOAuthState(state);
  if (!verified || verified.provider !== "google") return fail("ar", "invalid_state");

  try {
    const profile = await exchangeGoogleCode(code);
    const user = await resolveOAuthSessionUser({
      provider: "google",
      providerUserId: profile.sub,
      email: profile.email!,
      firstName: profile.given_name ?? profile.name?.split(" ")[0],
      lastName: profile.family_name ?? profile.name?.split(" ").slice(1).join(" "),
    });
    await createSession(user);
    return NextResponse.redirect(`${origin}/${verified.locale}/account`);
  } catch (error) {
    const code =
      error instanceof Error && error.message === "oauth_use_password_login"
        ? "use_password_login"
        : "google_failed";
    return fail(verified.locale, code);
  }
}
