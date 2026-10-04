import { prisma } from "@/lib/prisma";

export async function writeAdminAuditLog(input: {
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  if (!process.env.DATABASE_URL?.trim()) return;
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: input.adminId,
        adminEmail: input.adminEmail,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        oldValue: input.oldValue ?? undefined,
        newValue: input.newValue ?? undefined,
      },
    });
  } catch (error) {
    console.error("[admin-audit]", error instanceof Error ? error.message : error);
  }
}
