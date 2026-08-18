import { NextResponse } from "next/server";
import { getOrderRepository } from "@/lib/data/order-repository";
import { guestTrackSchema } from "@/lib/commerce/validation";

export async function POST(request: Request) {
  try {
    const body = guestTrackSchema.parse(await request.json());
    const order = await getOrderRepository().findGuestOrder(body.orderNumber, body.email);
    if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
