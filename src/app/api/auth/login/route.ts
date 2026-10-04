import { NextResponse } from "next/server";
import { ensureDatabaseReady, mapDatabaseError } from "@/lib/api/database-guard";
import { createSession, getUserRepository } from "@/lib/data/user-repository";
import { applyRouteRateLimit, RATE_LIMITS } from "@/lib/rate-limit/apply-route-rate-limit";

export async function POST(request: Request) {
  const limited = applyRouteRateLimit(request, RATE_LIMITS.login);
  if (limited) return limited;

  const dbGuard = await ensureDatabaseReady();
  if (dbGuard) return dbGuard;

  try {
    const { email, password } = (await request.json()) as { email: string; password: string };
    const user = await getUserRepository().login(email, password);
    await createSession(user);
    return NextResponse.json({ user });
  } catch (error) {
    const dbError = mapDatabaseError(error);
    if (dbError) return dbError;
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }
}
