import { NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/admin/audit-log";
import { requireAdminApi } from "@/lib/admin/api-guard";
import { replaceProductMainImage } from "@/lib/admin/product-admin";
import { storeProductMainImage } from "@/lib/media/product-media-storage";
import { appLogger } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
    if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "missing_file" }, { status: 400 });
    }

    const stored = await storeProductMainImage({ slug: product.slug, file });
    const { displayUrl } = await replaceProductMainImage(id, stored.publicUrl);

    await writeAdminAuditLog({
      adminId: guard.user.id,
      adminEmail: guard.user.email,
      action: "product.image.replace",
      entityType: "product",
      entityId: id,
      newValue: { url: stored.publicUrl },
    });

    return NextResponse.json({ ok: true, url: displayUrl, displayUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload_failed";
    appLogger.error("admin.products.image", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
