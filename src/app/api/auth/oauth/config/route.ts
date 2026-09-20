import { NextResponse } from "next/server";
import { getPublicOAuthAvailability } from "@/lib/auth/oauth-config";

export async function GET() {
  return NextResponse.json(getPublicOAuthAvailability());
}
