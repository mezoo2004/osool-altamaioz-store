import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminDashboardStats } from "@/lib/admin/dashboard-stats";

export default async function AdminHomePage() {
  const user = await requireAdminSession();
  const stats = await getAdminDashboardStats();

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="text-xl font-semibold">نظرة عامة</h2>
          <p className="mt-1 text-sm text-black/60">ملخص سريع للمتجر — بدون مصطلحات تقنية</p>
        </section>

        {!stats ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
            قاعدة البيانات غير متصلة. فعّل DATABASE_URL لتفعيل لوحة التحكم الكاملة.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="إجمالي المنتجات" value={stats.totalProducts} />
              <StatCard label="منتجات نشطة" value={stats.activeProducts} />
              <StatCard label="بأسعار مؤكدة" value={stats.productsWithPrice} />
              <StatCard label="تحتاج تسعير" value={stats.productsMissingPrice} accent />
              <StatCard label="التصنيفات" value={stats.categories} />
              <StatCard label="عروض نشطة" value={stats.activeOffers} />
              <StatCard label="حملات منبثقة" value={stats.promotionsActive} />
              <StatCard label="تقييمات بانتظار الموافقة" value={stats.pendingReviews} accent />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-black/10 bg-white p-5">
                <h3 className="font-semibold">المبيعات (طلبات مدفوعة/مخولة)</h3>
                <p className="mt-3 text-3xl font-semibold">{stats.salesSummary.revenue.toFixed(2)} ر.س</p>
                <p className="text-sm text-black/60">{stats.salesSummary.paidOrders} طلب</p>
              </section>
              <section className="rounded-2xl border border-black/10 bg-white p-5">
                <h3 className="font-semibold">حالة الصور</h3>
                <p className="mt-3 text-sm text-black/70">
                  {stats.imageStatus.productImages} صورة مرتبطة في قاعدة البيانات
                </p>
                <p className="text-sm text-black/60">{stats.imageStatus.catalogProducts} منتج في الكatalog</p>
              </section>
            </div>

            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <h3 className="font-semibold">أحدث الطلبات</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/10 text-black/60">
                      <th className="py-2 text-start">رقم الطلب</th>
                      <th className="py-2 text-start">الحالة</th>
                      <th className="py-2 text-start">الدفع</th>
                      <th className="py-2 text-start">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-black/5">
                        <td className="py-2">{order.orderNumber}</td>
                        <td className="py-2">{order.status}</td>
                        <td className="py-2">{order.paymentStatus}</td>
                        <td className="py-2">{order.grandTotal.toNumber().toFixed(2)} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <p className="text-sm text-black/60">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent ? "text-[#EA5A2D]" : ""}`}>{value}</p>
    </div>
  );
}
