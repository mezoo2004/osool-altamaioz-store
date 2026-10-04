"use client";

import { useState } from "react";

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function AdminOrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMessage(res.ok ? "تم تحديث حالة الطلب." : "تعذر التحديث.");
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 flex flex-wrap items-end gap-3">
      <label className="text-sm">
        <span className="mb-1 block">تحديث حالة الطلب</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-black/15 px-3 py-2"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={save} className="rounded-xl bg-black px-4 py-2 text-white">
        حفظ
      </button>
      {message && <p className="text-sm text-[#EA5A2D]">{message}</p>}
    </div>
  );
}
