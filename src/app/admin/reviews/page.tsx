import { AdminReviewActions } from "@/components/admin/admin-review-actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";
import { listAdminReviews } from "@/lib/admin/reviews-admin";

export default async function AdminReviewsPage() {
  const user = await requireAdminSession();
  const reviews = await listAdminReviews();

  return (
    <AdminShell user={user}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">التقييمات</h2>
        <p className="text-sm text-black/60">وافق أو ارفض — المعتمد فقط يظهر للعملاء عند تفعيل التخزين الدائم.</p>
        <div className="space-y-3">
          {reviews.map((review) => (
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
      </div>
    </AdminShell>
  );
}
