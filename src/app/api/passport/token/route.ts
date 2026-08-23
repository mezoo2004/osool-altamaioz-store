import { NextResponse } from "next/server";
import {
  createProductPassportToken,
  createPurchasePassportToken,
} from "@/lib/passport/passport-resolver";
import { getOrderRepository } from "@/lib/data/order-repository";
import { getSessionUser } from "@/lib/data/user-repository";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      type?: "product" | "purchase";
      slug?: string;
      variantId?: string;
      orderNumber?: string;
      orderItemId?: string;
      locale?: string;
    };

    const locale = body.locale === "en" ? "en" : "ar";

    if (body.type === "product" && body.slug) {
      const token = await createProductPassportToken(body.slug, body.variantId);
      return NextResponse.json({ token, locale });
    }

    if (body.type === "purchase" && body.orderNumber && body.orderItemId) {
      const user = await getSessionUser();
      if (!user) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }

      const order = await getOrderRepository().findByOrderNumber(body.orderNumber);
      if (!order || order.customerId !== user.id) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      const item = order.items.find((i) => i.id === body.orderItemId);
      if (!item) {
        return NextResponse.json({ error: "item_not_found" }, { status: 404 });
      }

      const token = await createPurchasePassportToken(body.orderNumber, body.orderItemId);
      return NextResponse.json({ token, locale });
    }

    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "token_failed" }, { status: 500 });
  }
}
