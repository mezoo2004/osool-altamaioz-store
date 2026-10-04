import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin/auth";
import { getSessionUser } from "@/lib/data/user-repository";

export async function requireAdminApi(): Promise<
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>> & { role: "ADMIN" } }
  | { ok: false; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!isAdminUser(user)) {
    return { ok: false, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { ok: true, user };
}
