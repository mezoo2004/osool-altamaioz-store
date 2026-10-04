import { NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/admin/audit-log";
import { requireAdminApi } from "@/lib/admin/api-guard";
import { revalidateCategories } from "@/lib/cache/revalidation";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const body = (await request.json()) as {
    nameAr?: string;
    nameEn?: string;
    sortOrder?: number;
    isActive?: boolean;
    imageUrl?: string | null;
  };

  const before = await prisma.category.findUnique({ where: { id } });
  const updated = await prisma.category.update({ where: { id }, data: body });

  await writeAdminAuditLog({
    adminId: guard.user.id,
    adminEmail: guard.user.email,
    action: "category.update",
    entityType: "category",
    entityId: id,
    oldValue: before,
    newValue: body,
  });

  revalidateCategories();
  return NextResponse.json({ ok: true, category: updated });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const count = await prisma.productCategory.count({ where: { categoryId: id } });
  const direct = await prisma.product.count({ where: { categoryId: id } });
  if (count + direct > 0) {
    return NextResponse.json({ error: "category_has_products" }, { status: 409 });
  }

  await prisma.category.delete({ where: { id } });
  revalidateCategories();
  return NextResponse.json({ ok: true });
}
