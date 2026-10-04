"use client";

import { useState } from "react";

type Row = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
  productCount: number;
};

export function AdminCategoryList({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const [message, setMessage] = useState<string | null>(null);

  async function saveRow(row: Row) {
    const res = await fetch(`/api/admin/categories/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameAr: row.nameAr,
        nameEn: row.nameEn,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
        imageUrl: row.imageUrl,
      }),
    });
    setMessage(res.ok ? "تم حفظ التصنيف." : "تعذر الحفظ.");
  }

  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div key={row.id} className="rounded-2xl border border-black/10 bg-white p-4 grid gap-3 md:grid-cols-6">
          <input
            className="rounded border border-black/15 px-2 py-1 md:col-span-2"
            value={row.nameAr}
            onChange={(e) => {
              const next = [...rows];
              next[idx] = { ...row, nameAr: e.target.value };
              setRows(next);
            }}
          />
          <input
            dir="ltr"
            className="rounded border border-black/15 px-2 py-1 md:col-span-2"
            value={row.nameEn}
            onChange={(e) => {
              const next = [...rows];
              next[idx] = { ...row, nameEn: e.target.value };
              setRows(next);
            }}
          />
          <input
            type="number"
            className="rounded border border-black/15 px-2 py-1"
            value={row.sortOrder}
            onChange={(e) => {
              const next = [...rows];
              next[idx] = { ...row, sortOrder: Number(e.target.value) };
              setRows(next);
            }}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={row.isActive}
              onChange={(e) => {
                const next = [...rows];
                next[idx] = { ...row, isActive: e.target.checked };
                setRows(next);
              }}
            />
            نشط ({row.productCount})
          </label>
          <button type="button" onClick={() => saveRow(row)} className="rounded bg-black px-3 py-1 text-white text-sm">
            حفظ
          </button>
        </div>
      ))}
      {message && <p className="text-sm text-[#EA5A2D]">{message}</p>}
    </div>
  );
}
