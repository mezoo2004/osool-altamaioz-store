import { NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/admin/audit-log";
import { requireAdminApi } from "@/lib/admin/api-guard";
import { revalidatePromotions } from "@/lib/cache/revalidation";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;
  const { id } = await context.params;
  const promotion = await prisma.promotion.findUnique({ where: { id } });
  if (!promotion) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ promotion });
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;
  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const before = await prisma.promotion.findUnique({ where: { id } });

  const updated = await prisma.promotion.update({
    where: { id },
    data: {
      status: body.status as never,
      priority: body.priority != null ? Number(body.priority) : undefined,
      popupEnabled: body.popupEnabled as boolean | undefined,
      heroEnabled: body.heroEnabled as boolean | undefined,
      desktopEnabled: body.desktopEnabled as boolean | undefined,
      mobileEnabled: body.mobileEnabled as boolean | undefined,
      frequency: body.frequency as never,
      titleAr: body.titleAr as string | undefined,
      titleEn: body.titleEn as string | undefined,
      subtitleAr: body.subtitleAr as string | undefined,
      subtitleEn: body.subtitleEn as string | undefined,
      imageUrl: body.imageUrl as string | null | undefined,
      primaryCtaLabelAr: body.primaryCtaLabelAr as string | undefined,
      primaryCtaLabelEn: body.primaryCtaLabelEn as string | undefined,
      primaryCtaUrl: body.primaryCtaUrl as string | undefined,
      secondaryCtaLabelAr: body.secondaryCtaLabelAr as string | undefined,
      secondaryCtaLabelEn: body.secondaryCtaLabelEn as string | undefined,
      secondaryCtaUrl: body.secondaryCtaUrl as string | undefined,
      discountPercentClaim:
        body.discountPercentClaim === null
          ? null
          : body.discountPercentClaim != null
            ? Number(body.discountPercentClaim)
            : undefined,
      startsAt: body.startsAt ? new Date(String(body.startsAt)) : body.startsAt === "" ? null : undefined,
      endsAt: body.endsAt ? new Date(String(body.endsAt)) : body.endsAt === "" ? null : undefined,
      updatedById: guard.user.id,
    },
  });

  await writeAdminAuditLog({
    adminId: guard.user.id,
    adminEmail: guard.user.email,
    action: "promotion.update",
    entityType: "promotion",
    entityId: id,
    oldValue: before,
    newValue: updated,
  });
  revalidatePromotions();
  return NextResponse.json({ ok: true, promotion: updated });
}
