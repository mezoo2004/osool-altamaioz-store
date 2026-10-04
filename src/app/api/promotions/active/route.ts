import { NextResponse } from "next/server";
import { getActiveStorePromotion, syncPromotionStatuses } from "@/lib/promotions/promotion-service";

export async function GET() {
  await syncPromotionStatuses();
  const promotion = await getActiveStorePromotion();
  return NextResponse.json(
    { promotion },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
