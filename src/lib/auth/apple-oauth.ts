import { SignJWT, importPKCS8 } from "jose";
import { getOAuthRedirectUri } from "@/lib/auth/oauth-config";

export function buildAppleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    redirect_uri: getOAuthRedirectUri("apple"),
    response_type: "code",
    response_mode: "query",
    scope: "name email",
    state,
  });
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

async function createAppleClientSecret(): Promise<string> {
  const privateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const key = await importPKCS8(privateKey, "ES256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: process.env.APPLE_KEY_ID! })
    .setIssuer(process.env.APPLE_TEAM_ID!)
    .setAudience("https://appleid.apple.com")
    .setSubject(process.env.APPLE_CLIENT_ID!)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
}

type AppleTokenResponse = {
  id_token?: string;
  error?: string;
};

type AppleIdTokenPayload = {
  sub: string;
  email?: string;
};

function decodeJwtPayload(token: string): AppleIdTokenPayload {
  const part = token.split(".")[1];
  if (!part) throw new Error("apple_token_invalid");
  const json = Buffer.from(part, "base64url").toString("utf8");
  return JSON.parse(json) as AppleIdTokenPayload;
}

export async function exchangeAppleCode(code: string): Promise<AppleIdTokenPayload & { email: string }> {
  const clientSecret = await createAppleClientSecret();
  const body = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: getOAuthRedirectUri("apple"),
  });

  const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const tokenJson = (await tokenRes.json()) as AppleTokenResponse;
  if (!tokenRes.ok || !tokenJson.id_token) {
    throw new Error(tokenJson.error ?? "apple_token_failed");
  }

  const payload = decodeJwtPayload(tokenJson.id_token);
  if (!payload.sub) throw new Error("apple_profile_incomplete");
  if (!payload.email) throw new Error("apple_email_missing");
  return { ...payload, email: payload.email };
}
