import { notFound } from "next/navigation";
import { AdminPromotionEditor, type AdminPromotionForm } from "@/components/admin/admin-promotion-editor";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

function toLocalInput(value: Date | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminPromotionEditPage({ params }: Props) {
  const user = await requireAdminSession();
  const { id } = await params;
  const row = await prisma.promotion.findUnique({ where: { id } });
  if (!row) notFound();

  const initial: AdminPromotionForm = {
    id: row.id,
    status: row.status,
    priority: row.priority,
    popupEnabled: row.popupEnabled,
    heroEnabled: row.heroEnabled,
    desktopEnabled: row.desktopEnabled,
    mobileEnabled: row.mobileEnabled,
    frequency: row.frequency,
    titleAr: row.titleAr,
    titleEn: row.titleEn,
    subtitleAr: row.subtitleAr ?? "",
    subtitleEn: row.subtitleEn ?? "",
    imageUrl: row.imageUrl,
    primaryCtaLabelAr: row.primaryCtaLabelAr,
    primaryCtaLabelEn: row.primaryCtaLabelEn,
    primaryCtaUrl: row.primaryCtaUrl,
    secondaryCtaLabelAr: row.secondaryCtaLabelAr ?? "",
    secondaryCtaLabelEn: row.secondaryCtaLabelEn ?? "",
    secondaryCtaUrl: row.secondaryCtaUrl ?? "",
    discountPercentClaim: row.discountPercentClaim,
    startsAt: toLocalInput(row.startsAt),
    endsAt: toLocalInput(row.endsAt),
  };

  return (
    <AdminShell user={user}>
      <AdminPromotionEditor initial={initial} />
    </AdminShell>
  );
}
