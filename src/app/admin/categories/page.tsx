import { AdminCategoryList } from "@/components/admin/admin-category-list";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const user = await requireAdminSession();
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameAr: "asc" }],
    include: { _count: { select: { productLinks: true, products: true } } },
  });

  const rows = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameAr: c.nameAr,
    nameEn: c.nameEn,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    imageUrl: c.imageUrl,
    productCount: c._count.productLinks + c._count.products,
  }));

  return (
    <AdminShell user={user}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">التصنيفات</h2>
        <p className="text-sm text-black/60">لا يمكن حذف تصنيف يحتوي منتجات.</p>
        <AdminCategoryList initialRows={rows} />
      </div>
    </AdminShell>
  );
}
