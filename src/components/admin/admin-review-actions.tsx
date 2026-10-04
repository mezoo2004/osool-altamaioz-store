"use client";

export function AdminReviewActions({ id, source }: { id: string; source: "file" | "db" }) {
  async function act(status: "APPROVED" | "REJECTED") {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, source }),
    });
    window.location.reload();
  }

  return (
    <div className="mt-3 flex gap-2">
      <button type="button" onClick={() => act("APPROVED")} className="rounded bg-black px-3 py-1 text-white text-sm">
        موافقة
      </button>
      <button type="button" onClick={() => act("REJECTED")} className="rounded border border-black/15 px-3 py-1 text-sm">
        رفض
      </button>
    </div>
  );
}
