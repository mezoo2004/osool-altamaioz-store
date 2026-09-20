import type { SessionUser } from "@/lib/commerce/types";
import { findOAuthLink, upsertOAuthLink } from "@/lib/auth/oauth-links-store";
import { getUserRepository } from "@/lib/data/user-repository";
import { requiresDatabaseStorage } from "@/lib/data/database-config";
import { prisma } from "@/lib/prisma";

export type OAuthUserProfile = {
  provider: "google" | "apple";
  providerUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export async function resolveOAuthSessionUser(profile: OAuthUserProfile): Promise<SessionUser> {
  const email = profile.email.toLowerCase().trim();
  if (!email) throw new Error("oauth_email_missing");

  const existingLink = findOAuthLink(profile.provider, profile.providerUserId);
  if (existingLink) {
    const user = await getUserRepository().findById(existingLink.customerId);
    if (user) return user;
  }

  if (requiresDatabaseStorage()) {
    return resolveOAuthPrisma(profile, email);
  }

  return resolveOAuthFile(profile, email);
}

async function resolveOAuthPrisma(profile: OAuthUserProfile, email: string): Promise<SessionUser> {
  const byEmail = await prisma.customer.findUnique({ where: { email } });
  if (byEmail) {
    if (byEmail.passwordHash) {
      throw new Error("oauth_use_password_login");
    }
    upsertOAuthLink({
      provider: profile.provider,
      providerUserId: profile.providerUserId,
      customerId: byEmail.id,
      email,
    });
    return {
      id: byEmail.id,
      email: byEmail.email,
      firstName: byEmail.firstName ?? "",
      lastName: byEmail.lastName ?? "",
      phone: byEmail.phone,
    };
  }

  const created = await prisma.customer.create({
    data: {
      email,
      passwordHash: null,
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      locale: "ar",
    },
  });

  upsertOAuthLink({
    provider: profile.provider,
    providerUserId: profile.providerUserId,
    customerId: created.id,
    email,
  });

  return {
    id: created.id,
    email: created.email,
    firstName: created.firstName ?? "",
    lastName: created.lastName ?? "",
    phone: created.phone,
  };
}

async function resolveOAuthFile(profile: OAuthUserProfile, email: string): Promise<SessionUser> {
  const { findFileUserByEmail, createOAuthFileUser } = await import("@/lib/auth/oauth-file-users");
  const existing = findFileUserByEmail(email);
  if (existing) {
    if (existing.passwordHash && existing.passwordHash.length > 0) {
      throw new Error("oauth_use_password_login");
    }
    upsertOAuthLink({
      provider: profile.provider,
      providerUserId: profile.providerUserId,
      customerId: existing.id,
      email,
    });
    return {
      id: existing.id,
      email: existing.email,
      firstName: existing.firstName,
      lastName: existing.lastName,
      phone: existing.phone,
    };
  }

  const user = await createOAuthFileUser({
    email,
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
  });

  upsertOAuthLink({
    provider: profile.provider,
    providerUserId: profile.providerUserId,
    customerId: user.id,
    email,
  });

  return user;
}
