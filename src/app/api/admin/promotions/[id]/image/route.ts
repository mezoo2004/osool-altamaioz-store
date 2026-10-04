import { NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/admin/audit-log";
import { requireAdminApi } from "@/lib/admin/api-guard";
import { revalidatePromotions } from "@/lib/cache/revalidation";
import { storePromotionImage } from "@/lib/media/product-media-storage";
import { appLogger } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

type PromoImageSlot = "desktop" | "mobile" | "background";

function parseSlot(value: FormDataEntryValue | null): PromoImageSlot {
  const raw = String(value ?? "desktop").toLowerCase();
  if (raw === "mobile" || raw === "background") return raw;
  return "desktop";
}

export async function POST(request: Request, context: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await context.params;
    const existing = await prisma.promotion.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "missing_file" }, { status: 400 });
    }

    const slot = parseSlot(form.get("slot"));
    const stored = await storePromotionImage({ promotionId: id, file, slot });

    const data =
      slot === "mobile"
        ? { imageUrlMobile: stored.publicUrl }
        : slot === "background"
          ? { backgroundImageUrl: stored.publicUrl }
          : { imageUrl: stored.publicUrl };

    const updated = await prisma.promotion.update({
      where: { id },
      data: { ...data, updatedById: guard.user.id },
    });

    await writeAdminAuditLog({
      adminId: guard.user.id,
      adminEmail: guard.user.email,
      action: "promotion.image.upload",
      entityType: "promotion",
      entityId: id,
      newValue: { slot, url: stored.publicUrl },
    });

    revalidatePromotions();
    return NextResponse.json({ ok: true, url: stored.publicUrl, slot, promotion: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload_failed";
    appLogger.error("admin.promotions.image", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
