import { NextResponse } from "next/server";
import { validateCart } from "@/lib/commerce/cart-service";
import type { CartLineInput } from "@/lib/commerce/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { lines: CartLineInput[] };
    const validated = await validateCart(body.lines ?? []);
    return NextResponse.json(validated);
  } catch {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
}
