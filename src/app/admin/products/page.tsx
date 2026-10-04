import Image from "next/image";
import Link from "next/link";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { searchAdminProducts } from "@/lib/admin/product-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminProductsPageProps = {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const user = await requireAdminSession();
  const sp = await searchParams;
  const page = Number(sp.page ?? "1") || 1;
  const result = await searchAdminProducts({
    q: sp.q,
    categorySlug: sp.category,
    page,
    pageSize: 20,
  });
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
    select: { slug: true, nameAr: true },
  });

  return (
    <AdminShell user={user}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">المنتجات</h2>
            <p className="text-sm text-black/60">{result.total} منتج</p>
          </div>
          <Link
            href="/admin/products/bulk-prices"
            className="rounded-full border border-black/15 px-4 py-2 text-sm"
          >
            تعديل أسعار جماعي
          </Link>
        </div>

        <form className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4 md:grid-cols-4">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="بحث بالاسم أو SKU"
            className="rounded-xl border border-black/15 px-3 py-2 md:col-span-2"
          />
          <select
            name="category"
            defaultValue={sp.category ?? ""}
            className="rounded-xl border border-black/15 px-3 py-2"
          >
            <option value="">كل التصنيفات</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nameAr}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-xl bg-black px-3 py-2 text-white">
            بحث
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-black/[0.03] text-black/60">
              <tr>
                <th className="px-4 py-3 text-start w-14" />
                <th className="px-4 py-3 text-start">المنتج</th>
                <th className="px-4 py-3 text-start">SKU</th>
                <th className="px-4 py-3 text-start">السعر</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((product) => {
                const variant = product.variants[0];
                const thumb = product.images[0]?.url ?? variant?.imageUrl ?? null;
                return (
                  <tr key={product.id} className="border-t border-black/5">
                    <td className="px-4 py-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-black/[0.04]">
                        {thumb && (
                          <Image src={thumb} alt="" fill className="object-cover" sizes="40px" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{product.nameAr}</p>
                      <p className="text-xs text-black/50">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{variant?.sku ?? "—"}</td>
                    <td className="px-4 py-3">
                      {variant?.price?.toNumber() != null
                        ? `${variant.price.toNumber().toFixed(2)} ر.س`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{product.status}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${product.id}`} className="text-[#EA5A2D]">
                        تعديل
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/admin/products"
          query={{ q: sp.q, category: sp.category }}
        />
      </div>
    </AdminShell>
  );
}
