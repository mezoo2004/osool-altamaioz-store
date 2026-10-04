import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminReviewActions } from "@/components/admin/admin-review-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { listAdminReviewsPaginated } from "@/lib/admin/reviews-admin-list";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminReviewsPage({ searchParams }: Props) {
  const user = await requireAdminSession();
  const sp = await searchParams;
  const page = Number(sp.page ?? "1") || 1;
  const result = await listAdminReviewsPaginated({ page, pageSize: 20 });

  return (
    <AdminShell user={user}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">التقييمات</h2>
        <p className="text-sm text-black/60">
          {result.total} تقييم — وافق أو ارفض؛ المعتمد فقط يظهر للعملاء عند تفعيل التخزين الدائم.
        </p>
        <div className="space-y-3">
          {result.items.map((review) => (
            <article key={`${review.source}-${review.id}`} className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{review.displayName}</p>
                <p className="text-xs text-black/50">{review.status}</p>
              </div>
              <p className="mt-2 text-sm">{review.body}</p>
              <p className="mt-1 text-xs text-black/50">
                {review.rating}/5 — {review.productSlug ?? "بدون منتج"}
              </p>
              {review.status === "PENDING" && (
                <AdminReviewActions id={review.id} source={review.source} />
              )}
            </article>
          ))}
        </div>
        <AdminPagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          basePath="/admin/reviews"
        />
      </div>
    </AdminShell>
  );
}
