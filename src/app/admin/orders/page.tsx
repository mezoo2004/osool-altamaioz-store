import Link from "next/link";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { listAdminOrders } from "@/lib/admin/orders-admin";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const user = await requireAdminSession();
  const sp = await searchParams;
  const page = Number(sp.page ?? "1") || 1;
  const result = await listAdminOrders({ page, pageSize: 25 });

  return (
    <AdminShell user={user}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">الطلبات</h2>
        <p className="text-sm text-black/60">{result.total} طلب</p>
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-black/[0.03] text-black/60">
              <tr>
                <th className="px-3 py-2 text-start">الطلب</th>
                <th className="px-3 py-2 text-start">العميل</th>
                <th className="px-3 py-2 text-start">الحالة</th>
                <th className="px-3 py-2 text-start">الدفع</th>
                <th className="px-3 py-2 text-start">الإجمالي</th>
                <th className="px-3 py-2 text-start">تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((order) => (
                <tr key={order.id} className="border-t border-black/5">
                  <td className="px-3 py-2">{order.orderNumber}</td>
                  <td className="px-3 py-2">
                    {order.customer?.email ?? order.guestEmail ?? "—"}
                    <div className="text-xs text-black/50">{order.guestPhone ?? order.customer?.phone}</div>
                  </td>
                  <td className="px-3 py-2">{order.status}</td>
                  <td className="px-3 py-2">{order.paymentStatus}</td>
                  <td className="px-3 py-2">{order.grandTotal.toNumber().toFixed(2)} ر.س</td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/orders/${order.id}`} className="text-[#EA5A2D]">
                      عرض
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminPagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/admin/orders"
        />
      </div>
    </AdminShell>
  );
}
