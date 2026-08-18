import { NextResponse } from "next/server";
import { destroySession } from "@/lib/data/user-repository";

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
