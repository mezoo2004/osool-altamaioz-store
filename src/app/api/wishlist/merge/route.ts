import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/data/user-repository";
import { getWishlistRepository } from "@/lib/data/wishlist";
import { requiresDatabaseStorage } from "@/lib/data/database-config";
import { checkDatabaseConnection } from "@/lib/prisma";

/** Merge guest browser wishlist slugs into the authenticated account. */
export async function POST(request: Request) {
  if (!requiresDatabaseStorage()) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  const conn = await checkDatabaseConnection();
  if (!conn.ok) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const body = (await request.json()) as { slugs?: string[] };
  const slugs = Array.isArray(body.slugs) ? body.slugs.filter(Boolean) : [];

  const repo = getWishlistRepository();
  const merged = await repo.merge(user.id, slugs);

  return NextResponse.json({ slugs: merged, storage: "database" });
}
