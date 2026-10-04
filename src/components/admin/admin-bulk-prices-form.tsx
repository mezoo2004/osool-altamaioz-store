"use client";

import { useState } from "react";

type Row = {
  id: string;
  nameAr: string;
  sku: string;
  sellingPrice: number | null;
  compareAtPrice: number | null;
};

export function AdminBulkPricesForm({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const [percent, setPercent] = useState(5);
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function saveManual() {
    if (!confirmed) {
      setMessage("فعّل خانة التأكيد قبل الحفظ.");
      return;
    }
    const res = await fetch("/api/admin/products/bulk-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true, updates: rows.map((r) => ({
        productId: r.id,
        sellingPrice: r.sellingPrice,
        compareAtPrice: r.compareAtPrice,
      })) }),
    });
    setMessage(res.ok ? "تم حفظ الأسعار." : "تعذر الحفظ.");
  }

  async function applyPercent() {
    if (!confirmed) {
      setMessage("فعّل خانة التأكيد قبل التطبيق.");
      return;
    }
    const res = await fetch("/api/admin/products/bulk-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confirm: true,
        percentChange: {
          direction,
          percent,
          productIds: rows.map((r) => r.id),
        },
      }),
    });
    setMessage(res.ok ? "تم تطبيق النسبة على المنتجات المعروضة." : "تعذر التطبيق.");
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
        أؤكد أنني أريد حفظ تغييرات الأسعار
      </label>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-black/[0.03]">
            <tr>
              <th className="px-3 py-2 text-start">المنتج</th>
              <th className="px-3 py-2 text-start">SKU</th>
              <th className="px-3 py-2 text-start">بيع</th>
              <th className="px-3 py-2 text-start">قبل الخصم</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="border-t border-black/5">
                <td className="px-3 py-2">{row.nameAr}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    className="w-28 rounded border border-black/15 px-2 py-1"
                    value={row.sellingPrice ?? ""}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = {
                        ...row,
                        sellingPrice: e.target.value === "" ? null : Number(e.target.value),
                      };
                      setRows(next);
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    className="w-28 rounded border border-black/15 px-2 py-1"
                    value={row.compareAtPrice ?? ""}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = {
                        ...row,
                        compareAtPrice: e.target.value === "" ? null : Number(e.target.value),
                      };
                      setRows(next);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={saveManual} className="rounded-xl bg-black px-4 py-2 text-white">
          حفظ الأسعار اليدوية
        </button>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as "increase" | "decrease")}
          className="rounded-xl border border-black/15 px-3 py-2"
        >
          <option value="increase">زيادة</option>
          <option value="decrease">تخفيض</option>
        </select>
        <input
          type="number"
          min={1}
          max={50}
          value={percent}
          onChange={(e) => setPercent(Number(e.target.value))}
          className="w-20 rounded-xl border border-black/15 px-2 py-2"
        />
        <button type="button" onClick={applyPercent} className="rounded-xl border border-black/15 px-4 py-2">
          تطبيق % على القائمة
        </button>
      </div>
      {message && <p className="text-sm text-[#EA5A2D]">{message}</p>}
    </div>
  );
}
