export type OAuthProviderId = "google" | "apple";

export function getSiteOrigin(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export function isAppleOAuthConfigured(): boolean {
  return Boolean(
    process.env.APPLE_CLIENT_ID?.trim() &&
      process.env.APPLE_TEAM_ID?.trim() &&
      process.env.APPLE_KEY_ID?.trim() &&
      process.env.APPLE_PRIVATE_KEY?.trim(),
  );
}

export function getOAuthRedirectUri(provider: OAuthProviderId): string {
  return `${getSiteOrigin()}/api/auth/oauth/${provider}/callback`;
}

export function getPublicOAuthAvailability() {
  return {
    google: isGoogleOAuthConfigured(),
    apple: isAppleOAuthConfigured(),
  };
}
