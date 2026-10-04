import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPromotionsPage() {
  const user = await requireAdminSession();
  const promotions = await prisma.promotion.findMany({
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <AdminShell user={user}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">العروض والحملات</h2>
          <Link href="/admin/promotions/new" className="rounded-full bg-[#EA5A2D] px-4 py-2 text-white text-sm">
            حملة جديدة
          </Link>
        </div>
        <div className="space-y-2">
          {promotions.map((p) => (
            <Link
              key={p.id}
              href={`/admin/promotions/${p.id}`}
              className="block rounded-2xl border border-black/10 bg-white p-4 hover:border-black/25"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{p.titleAr}</p>
                <span className="text-xs rounded-full bg-black/[0.05] px-2 py-1">{p.status}</span>
              </div>
              <p className="text-sm text-black/60 mt-1">{p.titleEn}</p>
            </Link>
          ))}
          {promotions.length === 0 && (
            <p className="text-sm text-black/60">لا توجد حملات — أنشئ حملة لتفعيل النافذة الترويجية.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
