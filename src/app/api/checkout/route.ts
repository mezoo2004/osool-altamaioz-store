import { NextResponse } from "next/server";
import { ensureDatabaseReady, mapDatabaseError } from "@/lib/api/database-guard";
import { getOrderRepository } from "@/lib/data/order-repository";
import { getSessionUser } from "@/lib/data/user-repository";
import type { CheckoutInput } from "@/lib/commerce/types";

export async function POST(request: Request) {
  const dbGuard = await ensureDatabaseReady();
  if (dbGuard) return dbGuard;

  try {
    const body = (await request.json()) as CheckoutInput;
    const user = await getSessionUser();
    const order = await getOrderRepository().createFromCheckout(body, user?.id ?? null);
    void import("@/lib/notifications/notification-service").then(({ dispatchOrderConfirmedNotifications }) =>
      dispatchOrderConfirmedNotifications(order).catch(() => undefined),
    );
    return NextResponse.json({ order });
  } catch (error) {
    const dbError = mapDatabaseError(error);
    if (dbError) return dbError;
    const message = error instanceof Error ? error.message : "order_failed";
    const status =
      message === "price_unavailable" || message === "stock_unavailable"
        ? 422
        : message === "payment_unavailable" || message === "database_unavailable"
          ? 503
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
