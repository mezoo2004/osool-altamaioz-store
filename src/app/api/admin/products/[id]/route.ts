import { NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/admin/audit-log";
import { requireAdminApi } from "@/lib/admin/api-guard";
import { updateAdminProduct } from "@/lib/admin/product-admin";
import { appLogger } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      nameAr?: string;
      nameEn?: string;
      descriptionAr?: string | null;
      descriptionEn?: string | null;
      status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
      primaryCategorySlug?: string;
      sellingPrice?: number | null;
      compareAtPrice?: number | null;
    };

    const before = await prisma.product.findUnique({
      where: { id },
      include: { variants: { where: { isDefault: true }, take: 1 } },
    });
    const slug = await updateAdminProduct({ productId: id, ...body });

    await writeAdminAuditLog({
      adminId: guard.user.id,
      adminEmail: guard.user.email,
      action: "product.update",
      entityType: "product",
      entityId: id,
      oldValue: before,
      newValue: body,
    });

    return NextResponse.json({ ok: true, slug });
  } catch (error) {
    appLogger.error("admin.products.patch", "failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
