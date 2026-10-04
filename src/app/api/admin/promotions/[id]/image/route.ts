import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-guard";
import { revalidatePromotions } from "@/lib/cache/revalidation";
import { storePromotionImage } from "@/lib/media/product-media-storage";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "missing_file" }, { status: 400 });

  const stored = await storePromotionImage({ promotionId: id, file });
  await prisma.promotion.update({ where: { id }, data: { imageUrl: stored.publicUrl, updatedById: guard.user.id } });
  revalidatePromotions();
  return NextResponse.json({ ok: true, url: stored.publicUrl });
}
