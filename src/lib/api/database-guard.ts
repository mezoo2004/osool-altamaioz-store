import { NextResponse } from "next/server";
import {
  DatabaseNotConfiguredError,
  DatabaseUnavailableError,
  requiresDatabaseStorage,
} from "@/lib/data/database-config";
import { checkDatabaseConnection } from "@/lib/prisma";

export async function ensureDatabaseReady(): Promise<NextResponse | null> {
  if (!requiresDatabaseStorage()) return null;

  const result = await checkDatabaseConnection();
  if (!result.ok) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
  return null;
}

export function mapDatabaseError(error: unknown): NextResponse | null {
  if (error instanceof DatabaseUnavailableError || error instanceof DatabaseNotConfiguredError) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }
  return null;
}
