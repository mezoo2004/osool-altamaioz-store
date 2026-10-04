import { AdminBulkPricesForm } from "@/components/admin/admin-bulk-prices-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { searchAdminProducts } from "@/lib/admin/product-admin";

export default async function AdminBulkPricesPage() {
  const user = await requireAdminSession();
  const result = await searchAdminProducts({ page: 1, pageSize: 50 });

  const rows = result.items.map((product) => {
    const variant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
    const attrs = (variant?.attributes ?? {}) as Record<string, unknown>;
    return {
      id: product.id,
      nameAr: product.nameAr,
      sku: variant?.sku ?? "",
      sellingPrice: variant?.price?.toNumber() ?? null,
      compareAtPrice: typeof attrs.compareAtPrice === "number" ? attrs.compareAtPrice : null,
    };
  });

  return (
    <AdminShell user={user}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">تعديل أسعار جماعي</h2>
        <p className="text-sm text-black/60">
          عدّل الأسعار يدوياً أو نفّذ تغييراً بنسبة مئوية — يتطلب تأكيداً قبل الحفظ.
        </p>
        <AdminBulkPricesForm initialRows={rows} />
      </div>
    </AdminShell>
  );
}
