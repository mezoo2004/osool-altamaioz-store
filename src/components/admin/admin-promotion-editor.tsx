"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { EntryPromoModal } from "@/components/promotions/entry-promo-modal";
import type { PublicPromotion } from "@/lib/promotions/promotion-service";

export type AdminPromotionForm = {
  id?: string;
  status: "DRAFT" | "SCHEDULED" | "ACTIVE" | "EXPIRED";
  priority: number;
  popupEnabled: boolean;
  heroEnabled: boolean;
  desktopEnabled: boolean;
  mobileEnabled: boolean;
  frequency: "SESSION" | "DAILY";
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  imageUrl: string | null;
  primaryCtaLabelAr: string;
  primaryCtaLabelEn: string;
  primaryCtaUrl: string;
  secondaryCtaLabelAr: string;
  secondaryCtaLabelEn: string;
  secondaryCtaUrl: string;
  discountPercentClaim: number | null;
  startsAt: string;
  endsAt: string;
};

export function AdminPromotionEditor({ initial }: { initial: AdminPromotionForm }) {
  const [form, setForm] = useState(initial);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const previewPromo: PublicPromotion = useMemo(
    () => ({
      id: form.id ?? "preview",
      titleAr: form.titleAr,
      titleEn: form.titleEn,
      subtitleAr: form.subtitleAr || null,
      subtitleEn: form.subtitleEn || null,
      imageUrl: form.imageUrl,
      primaryCtaLabelAr: form.primaryCtaLabelAr,
      primaryCtaLabelEn: form.primaryCtaLabelEn,
      primaryCtaUrl: form.primaryCtaUrl,
      secondaryCtaLabelAr: form.secondaryCtaLabelAr || null,
      secondaryCtaLabelEn: form.secondaryCtaLabelEn || null,
      secondaryCtaUrl: form.secondaryCtaUrl || null,
      discountPercentClaim: form.discountPercentClaim,
      frequency: form.frequency,
      desktopEnabled: form.desktopEnabled,
      mobileEnabled: form.mobileEnabled,
    }),
    [form],
  );

  async function save() {
    const res = await fetch(form.id ? `/api/admin/promotions/${form.id}` : "/api/admin/promotions", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await res.json()) as { id?: string; error?: string };
    if (!res.ok) {
      setMessage(data.error ?? "تعذر الحفظ");
      return;
    }
    if (!form.id && data.id) {
      window.location.href = `/admin/promotions/${data.id}`;
      return;
    }
    setMessage("تم حفظ الحملة — ستنعكس على المتجر بعد لحظات.");
  }

  async function uploadImage(file: File) {
    if (!form.id) {
      setMessage("احفظ الحملة أولاً ثم ارفع الصورة.");
      return;
    }
    const body = new FormData();
    body.set("file", file);
    const res = await fetch(`/api/admin/promotions/${form.id}/image`, { method: "POST", body });
    const data = (await res.json()) as { url?: string };
    if (res.ok && data.url) setForm({ ...form, imageUrl: data.url });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="space-y-3 rounded-2xl border border-black/10 bg-white p-4">
        <h3 className="font-semibold">إعدادات الحملة</h3>
        <Field label="العنوان (عربي)" value={form.titleAr} onChange={(v) => setForm({ ...form, titleAr: v })} />
        <Field label="Title (EN)" value={form.titleEn} onChange={(v) => setForm({ ...form, titleEn: v })} dir="ltr" />
        <Field label="الوصف (عربي)" value={form.subtitleAr} onChange={(v) => setForm({ ...form, subtitleAr: v })} />
        <Field label="Subtitle (EN)" value={form.subtitleEn} onChange={(v) => setForm({ ...form, subtitleEn: v })} dir="ltr" />
        <Field label="CTA أساسي AR" value={form.primaryCtaLabelAr} onChange={(v) => setForm({ ...form, primaryCtaLabelAr: v })} />
        <Field label="Primary CTA EN" value={form.primaryCtaLabelEn} onChange={(v) => setForm({ ...form, primaryCtaLabelEn: v })} dir="ltr" />
        <Field label="رابط CTA أساسي" value={form.primaryCtaUrl} onChange={(v) => setForm({ ...form, primaryCtaUrl: v })} dir="ltr" />
        <Field label="CTA ثانوي AR" value={form.secondaryCtaLabelAr} onChange={(v) => setForm({ ...form, secondaryCtaLabelAr: v })} />
        <Field label="Secondary CTA EN" value={form.secondaryCtaLabelEn} onChange={(v) => setForm({ ...form, secondaryCtaLabelEn: v })} dir="ltr" />
        <Field label="رابط CTA ثانوي" value={form.secondaryCtaUrl} onChange={(v) => setForm({ ...form, secondaryCtaUrl: v })} dir="ltr" />
        <label className="text-sm block">
          <span className="mb-1 block">نسبة خصم معلنة (اختياري — يجب تأكيدها)</span>
          <input
            type="number"
            min={1}
            max={90}
            value={form.discountPercentClaim ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                discountPercentClaim: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            className="w-full rounded-xl border border-black/15 px-3 py-2"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <label>
            البداية
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              className="mt-1 w-full rounded border border-black/15 px-2 py-1"
            />
          </label>
          <label>
            النهاية
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              className="mt-1 w-full rounded border border-black/15 px-2 py-1"
            />
          </label>
        </div>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as AdminPromotionForm["status"] })}
          className="w-full rounded-xl border border-black/15 px-3 py-2"
        >
          <option value="DRAFT">DRAFT</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>
        <select
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value as "SESSION" | "DAILY" })}
          className="w-full rounded-xl border border-black/15 px-3 py-2"
        >
          <option value="SESSION">مرة لكل جلسة</option>
          <option value="DAILY">مرة كل 24 ساعة</option>
        </select>
        <div className="flex flex-wrap gap-3 text-sm">
          {(
            [
              ["popupEnabled", "النافذة المنبثقة"],
              ["desktopEnabled", "سطح المكتب"],
              ["mobileEnabled", "الجوال"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
        {form.imageUrl && (
          <div className="relative h-24 w-40">
            <Image src={form.imageUrl} alt="" fill className="object-cover rounded-lg" />
          </div>
        )}
        <button type="button" onClick={save} className="rounded-xl bg-[#EA5A2D] px-4 py-2 text-white">
          حفظ الحملة
        </button>
        {message && <p className="text-sm text-black/70">{message}</p>}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">معاينة مباشرة</h3>
          <button type="button" className="text-sm underline" onClick={() => setPreviewOpen((v) => !v)}>
            {previewOpen ? "إخفاء" : "إظهار"}
          </button>
        </div>
        <div className="rounded-2xl border border-black/10 bg-[#111] p-4">
          <p className="mb-2 text-xs text-white/60">Desktop</p>
          <div className="relative min-h-[320px] rounded-xl bg-white/5">
            {previewOpen && (
              <EntryPromoModal
                locale="ar"
                promotion={previewPromo}
                forceOpen
                onClose={() => setPreviewOpen(false)}
              />
            )}
          </div>
        </div>
        <div className="mx-auto w-[390px] rounded-2xl border border-black/10 bg-[#111] p-3">
          <p className="mb-2 text-xs text-white/60">Mobile</p>
          <div className="relative min-h-[520px] rounded-xl bg-white/5">
            {previewOpen && (
              <EntryPromoModal
                locale="ar"
                promotion={previewPromo}
                forceOpen
                onClose={() => setPreviewOpen(false)}
              />
            )}
          </div>
        </div>
      </section>
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
    <label className="text-sm block">
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
