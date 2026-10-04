import { NextResponse } from "next/server";
import type { OrderStatus } from "@prisma/client";
import { writeAdminAuditLog } from "@/lib/admin/audit-log";
import { requireAdminApi } from "@/lib/admin/api-guard";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

const allowed: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  const body = (await request.json()) as { status?: OrderStatus };
  if (!body.status || !allowed.includes(body.status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const before = await prisma.order.findUnique({ where: { id } });
  const updated = await prisma.order.update({
    where: { id },
    data: { status: body.status },
  });

  await writeAdminAuditLog({
    adminId: guard.user.id,
    adminEmail: guard.user.email,
    action: "order.status",
    entityType: "order",
    entityId: id,
    oldValue: { status: before?.status },
    newValue: { status: body.status },
  });

  return NextResponse.json({ ok: true, order: updated });
}
