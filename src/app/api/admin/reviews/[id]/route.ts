import { NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/admin/audit-log";
import { requireAdminApi } from "@/lib/admin/api-guard";
import { setReviewStatus } from "@/lib/admin/reviews-admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const body = (await request.json()) as {
    status?: "APPROVED" | "REJECTED";
    source?: "file" | "db";
  };
  if (!body.status || !body.source) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  await setReviewStatus({ id, source: body.source, status: body.status });

  await writeAdminAuditLog({
    adminId: guard.user.id,
    adminEmail: guard.user.email,
    action: "review.moderate",
    entityType: "review",
    entityId: id,
    newValue: body,
  });

  return NextResponse.json({ ok: true });
}
