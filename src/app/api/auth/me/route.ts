import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/data/user-repository";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}
