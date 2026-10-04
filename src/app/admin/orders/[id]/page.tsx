import { notFound } from "next/navigation";
import { AdminOrderStatusForm } from "@/components/admin/admin-order-status-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const user = await requireAdminSession();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  return (
    <AdminShell user={user}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">طلب {order.orderNumber}</h2>
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm space-y-2">
          <p>العميل: {order.customer?.email ?? order.guestEmail ?? "—"}</p>
          <p>الهاتف: {order.guestPhone ?? order.customer?.phone ?? "—"}</p>
          <p>حالة الطلب: {order.status}</p>
          <p>حالة الدفع: {order.paymentStatus}</p>
          <p>الإجمالي: {order.grandTotal.toNumber().toFixed(2)} ر.س</p>
        </div>
        <AdminOrderStatusForm orderId={order.id} currentStatus={order.status} />
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <h3 className="font-semibold">المنتجات</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 border-b border-black/5 pb-2">
                <span>{item.nameArSnapshot}</span>
                <span>
                  {item.quantity} × {item.unitPrice.toNumber().toFixed(2)} ر.س
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
