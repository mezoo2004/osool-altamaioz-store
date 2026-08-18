import { NextRequest, NextResponse } from "next/server";
import { getProductRepository } from "@/lib/data";

async function fetchBySlugs(slugs: string[]) {
  const repo = getProductRepository();
  return (await Promise.all(slugs.map((slug) => repo.getBySlug(slug)))).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const slugsParam = request.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = slugsParam.split(",").filter(Boolean);
  const products = await fetchBySlugs(slugs);
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { slugs?: string[] };
  const slugs = body.slugs ?? [];
  const products = await fetchBySlugs(slugs);
  return NextResponse.json({ products });
}
