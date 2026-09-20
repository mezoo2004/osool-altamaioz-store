import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const STATE_COOKIE = "osool_oauth_state";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-change-in-production-osool-altamaioz",
);

export async function createOAuthState(provider: string, locale: string): Promise<string> {
  const state = await new SignJWT({ provider, locale })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return state;
}

export async function verifyOAuthState(state: string): Promise<{ provider: string; locale: string } | null> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(STATE_COOKIE)?.value;
  if (!stored || stored !== state) return null;

  try {
    const { payload } = await jwtVerify(stored, secret);
    cookieStore.delete(STATE_COOKIE);
    const provider = payload.provider;
    const locale = payload.locale;
    if (typeof provider !== "string" || typeof locale !== "string") return null;
    return { provider, locale };
  } catch {
    return null;
  }
}
