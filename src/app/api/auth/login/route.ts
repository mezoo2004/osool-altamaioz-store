import { NextResponse } from "next/server";
import { ensureDatabaseReady, mapDatabaseError } from "@/lib/api/database-guard";
import { createSession, getUserRepository } from "@/lib/data/user-repository";

export async function POST(request: Request) {
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
