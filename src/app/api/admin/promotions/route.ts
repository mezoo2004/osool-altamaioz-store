import { NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/admin/audit-log";
import { requireAdminApi } from "@/lib/admin/api-guard";
import { revalidatePromotions } from "@/lib/cache/revalidation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;
  const rows = await prisma.promotion.findMany({ orderBy: [{ priority: "desc" }, { updatedAt: "desc" }] });
  return NextResponse.json({ promotions: rows });
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const body = (await request.json()) as Record<string, unknown>;
  const created = await prisma.promotion.create({
    data: {
      status: (body.status as "DRAFT") ?? "DRAFT",
      priority: Number(body.priority ?? 0),
      popupEnabled: Boolean(body.popupEnabled ?? true),
      heroEnabled: Boolean(body.heroEnabled ?? false),
      desktopEnabled: Boolean(body.desktopEnabled ?? true),
      mobileEnabled: Boolean(body.mobileEnabled ?? true),
      frequency: (body.frequency as "SESSION") ?? "SESSION",
      titleAr: String(body.titleAr ?? "عرض خاص"),
      titleEn: String(body.titleEn ?? "Special offer"),
      subtitleAr: body.subtitleAr ? String(body.subtitleAr) : null,
      subtitleEn: body.subtitleEn ? String(body.subtitleEn) : null,
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      imageUrlMobile: body.imageUrlMobile ? String(body.imageUrlMobile) : null,
      backgroundImageUrl: body.backgroundImageUrl ? String(body.backgroundImageUrl) : null,
      themePreset: (body.themePreset as "OSOOL_DEFAULT") ?? "OSOOL_DEFAULT",
      themeOverrides: body.themeOverrides ? (body.themeOverrides as object) : undefined,
      primaryCtaLabelAr: String(body.primaryCtaLabelAr ?? "تصفح العروض"),
      primaryCtaLabelEn: String(body.primaryCtaLabelEn ?? "Browse offers"),
      primaryCtaUrl: String(body.primaryCtaUrl ?? "/ar/offers"),
      secondaryCtaLabelAr: body.secondaryCtaLabelAr ? String(body.secondaryCtaLabelAr) : "تصفح المنتجات",
      secondaryCtaLabelEn: body.secondaryCtaLabelEn ? String(body.secondaryCtaLabelEn) : "Browse products",
      secondaryCtaUrl: body.secondaryCtaUrl ? String(body.secondaryCtaUrl) : "/ar/products",
      discountPercentClaim:
        body.discountPercentClaim == null ? null : Number(body.discountPercentClaim),
      startsAt: body.startsAt ? new Date(String(body.startsAt)) : null,
      endsAt: body.endsAt ? new Date(String(body.endsAt)) : null,
      createdById: guard.user.id,
      updatedById: guard.user.id,
    },
  });

  await writeAdminAuditLog({
    adminId: guard.user.id,
    adminEmail: guard.user.email,
    action: "promotion.create",
    entityType: "promotion",
    entityId: created.id,
    newValue: created,
  });
  revalidatePromotions();
  return NextResponse.json({ id: created.id, promotion: created });
}
