import { SignJWT, jwtVerify } from "jose";
import type {
  PassportTokenPayload,
  ProductPassportTokenPayload,
  PurchasePassportTokenPayload,
} from "./types";

const PASSPORT_SECRET = new TextEncoder().encode(
  process.env.PASSPORT_SECRET ??
    process.env.AUTH_SECRET ??
    "dev-only-passport-secret-osool-altamaioz",
);

const ISSUER = "osool-altamaioz-passport";

export async function signProductPassportToken(
  payload: Omit<ProductPassportTokenPayload, "typ">,
): Promise<string> {
  return new SignJWT({ typ: "product", ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("passport")
    .setIssuer(ISSUER)
    .setIssuedAt()
    .sign(PASSPORT_SECRET);
}

export async function signPurchasePassportToken(
  payload: Omit<PurchasePassportTokenPayload, "typ">,
): Promise<string> {
  return new SignJWT({ typ: "purchase", on: payload.on, oi: payload.oi })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("passport")
    .setIssuer(ISSUER)
    .setIssuedAt()
    .sign(PASSPORT_SECRET);
}

export async function verifyPassportToken(token: string): Promise<PassportTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, PASSPORT_SECRET, {
      issuer: ISSUER,
      subject: "passport",
    });

    if (payload.typ === "product" && typeof payload.slug === "string") {
      return {
        typ: "product",
        slug: payload.slug,
        variantId: typeof payload.variantId === "string" ? payload.variantId : undefined,
      };
    }

    if (
      payload.typ === "purchase" &&
      typeof payload.on === "string" &&
      typeof payload.oi === "string"
    ) {
      return { typ: "purchase", on: payload.on, oi: payload.oi };
    }

    return null;
  } catch {
    return null;
  }
}
