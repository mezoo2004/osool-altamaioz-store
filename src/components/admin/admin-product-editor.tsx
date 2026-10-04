"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type AdminProductEditorProps = {
  product: {
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string | null;
    descriptionEn: string | null;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    primaryCategorySlug: string | null;
    imageUrl: string | null;
    defaultSku: string;
    sellingPrice: number | null;
    compareAtPrice: number | null;
  };
  categories: { slug: string; nameAr: string }[];
};

export function AdminProductEditor({ product, categories }: AdminProductEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState(product);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pricePreview = useMemo(() => {
    const sell = form.sellingPrice;
    const compare = form.compareAtPrice;
    if (sell == null) return null;
    if (compare != null && compare > sell) {
      return { compare, sell };
    }
    return { compare: null, sell };
  }, [form.compareAtPrice, form.sellingPrice]);

  async function saveProduct() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        descriptionAr: form.descriptionAr,
        descriptionEn: form.descriptionEn,
        status: form.status,
        primaryCategorySlug: form.primaryCategorySlug,
        sellingPrice: form.sellingPrice,
        compareAtPrice: form.compareAtPrice,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setMessage("تعذر حفظ المنتج.");
      return;
    }
    setMessage("تم حفظ المنتج.");
    router.refresh();
  }

  async function uploadImage() {
    if (!file) return;
    setLoading(true);
    setMessage(null);
    const body = new FormData();
    body.set("file", file);
    const res = await fetch(`/api/admin/products/${product.id}/image`, { method: "POST", body });
    setLoading(false);
    if (!res.ok) {
      setMessage("تعذر رفع الصورة.");
      return;
    }
    setMessage("تم تحديث الصورة.");
    setFile(null);
    setPreviewUrl(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/10 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-black/50">SKU (للقراءة فقط)</p>
            <p className="font-mono text-sm">{form.defaultSku}</p>
          </div>
          <p className="text-xs text-black/50">{form.slug}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="الاسم (عربي)" value={form.nameAr} onChange={(v) => setForm({ ...form, nameAr: v })} />
          <Field label="الاسم (English)" value={form.nameEn} onChange={(v) => setForm({ ...form, nameEn: v })} dir="ltr" />
          <TextArea label="الوصف (عربي)" value={form.descriptionAr ?? ""} onChange={(v) => setForm({ ...form, descriptionAr: v })} />
          <TextArea label="Description (EN)" value={form.descriptionEn ?? ""} onChange={(v) => setForm({ ...form, descriptionEn: v })} dir="ltr" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block">التصنيف</span>
            <select
              value={form.primaryCategorySlug ?? ""}
              onChange={(e) => setForm({ ...form, primaryCategorySlug: e.target.value || null })}
              className="w-full rounded-xl border border-black/15 px-3 py-2"
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nameAr}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block">الحالة</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as AdminProductEditorProps["product"]["status"] })
              }
              className="w-full rounded-xl border border-black/15 px-3 py-2"
            >
              <option value="ACTIVE">نشط</option>
              <option value="DRAFT">مسودة</option>
              <option value="ARCHIVED">مؤرشف</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <NumberField
            label="سعر البيع (ر.س)"
            value={form.sellingPrice}
            onChange={(v) => setForm({ ...form, sellingPrice: v })}
          />
          <NumberField
            label="سعر قبل الخصم (عرض فقط)"
            value={form.compareAtPrice}
            onChange={(v) => setForm({ ...form, compareAtPrice: v })}
          />
        </div>
        {pricePreview && (
          <p className="text-sm">
            معاينة:{" "}
            {pricePreview.compare != null && (
              <span className="text-black/45 line-through">{pricePreview.compare.toFixed(2)} ر.س</span>
            )}{" "}
            <span className="font-semibold text-[#EA5A2D]">{pricePreview.sell.toFixed(2)} ر.س</span>
          </p>
        )}

        <button
          type="button"
          onClick={saveProduct}
          disabled={loading}
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          حفظ المنتج
        </button>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-5 space-y-4">
        <h3 className="font-semibold">صورة المنتج</h3>
        <div className="flex flex-wrap gap-4">
          <div className="relative h-40 w-40 overflow-hidden rounded-xl bg-black/[0.04]">
            {(previewUrl || form.imageUrl) && (
              <Image
                src={previewUrl ?? form.imageUrl!}
                alt=""
                fill
                className="object-cover"
                unoptimized={!!previewUrl}
              />
            )}
          </div>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const next = e.target.files?.[0] ?? null;
                setFile(next);
                setPreviewUrl(next ? URL.createObjectURL(next) : null);
              }}
            />
            <button
              type="button"
              onClick={uploadImage}
              disabled={!file || loading}
              className="rounded-xl border border-black/15 px-4 py-2 text-sm disabled:opacity-50"
            >
              رفع واستبدال الصورة
            </button>
          </div>
        </div>
      </section>

      {message && <p className="text-sm text-[#EA5A2D]">{message}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block">{label}</span>
      <input
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-black/15 px-3 py-2"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block">{label}</span>
      <textarea
        dir={dir}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-black/15 px-3 py-2"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block">{label}</span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full rounded-xl border border-black/15 px-3 py-2"
      />
    </label>
  );
}
