import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/commerce/types";
import { getSessionUser } from "@/lib/data/user-repository";

export function isAdminUser(user: SessionUser | null): user is SessionUser & { role: "ADMIN" } {
  return user?.role === "ADMIN";
}

export async function requireAdminSession(): Promise<SessionUser & { role: "ADMIN" }> {
  const user = await getSessionUser();
  if (!isAdminUser(user)) {
    redirect("/admin/login?error=unauthorized");
  }
  return user;
}

export async function getAdminSessionOrNull(): Promise<(SessionUser & { role: "ADMIN" }) | null> {
  const user = await getSessionUser();
  return isAdminUser(user) ? user : null;
}
