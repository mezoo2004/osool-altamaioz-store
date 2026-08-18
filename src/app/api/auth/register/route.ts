import { NextResponse } from "next/server";
import { ensureDatabaseReady, mapDatabaseError } from "@/lib/api/database-guard";
import { createSession, getUserRepository } from "@/lib/data/user-repository";

export async function POST(request: Request) {
  const dbGuard = await ensureDatabaseReady();
  if (dbGuard) return dbGuard;

  try {
    const body = (await request.json()) as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    };
    const user = await getUserRepository().register(body);
    await createSession(user);
    return NextResponse.json({ user });
  } catch (error) {
    const dbError = mapDatabaseError(error);
    if (dbError) return dbError;
    const message = error instanceof Error ? error.message : "register_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
