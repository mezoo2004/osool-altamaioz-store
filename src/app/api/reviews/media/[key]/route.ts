import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const UPLOAD_DIR = path.join(process.cwd(), "data", "reviews", "uploads");

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

type RouteParams = { params: Promise<{ key: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { key } = await params;
  const safe = path.basename(decodeURIComponent(key));
  if (safe !== decodeURIComponent(key) || safe.includes("..")) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const ext = safe.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME[ext] ?? "application/octet-stream";
  const buffer = fs.readFileSync(filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
