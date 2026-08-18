import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/data/user-repository";
import { getWishlistRepository } from "@/lib/data/wishlist";
import { requiresDatabaseStorage } from "@/lib/data/database-config";
import { checkDatabaseConnection } from "@/lib/prisma";

export async function GET() {
  if (!requiresDatabaseStorage()) {
    return NextResponse.json({ slugs: [], storage: "client" });
  }

  const conn = await checkDatabaseConnection();
  if (!conn.ok) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ slugs: [], storage: "client" });
  }

  const repo = getWishlistRepository();
  const slugs = await repo.list(user.id);
  return NextResponse.json({ slugs, storage: "database" });
}

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

  const body = (await request.json()) as { slug?: string; action?: "toggle" | "add" | "remove" };
  const slug = body.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }

  const repo = getWishlistRepository();
  const current = await repo.list(user.id);
  let slugs: string[];

  switch (body.action) {
    case "remove":
      slugs = await repo.remove(user.id, slug);
      break;
    case "add":
      slugs = await repo.add(user.id, slug);
      break;
    case "toggle":
    default:
      slugs = current.includes(slug)
        ? await repo.remove(user.id, slug)
        : await repo.add(user.id, slug);
      break;
  }

  return NextResponse.json({ slugs, storage: "database" });
}
