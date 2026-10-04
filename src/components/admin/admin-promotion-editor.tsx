"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { EntryPromoModal } from "@/components/promotions/entry-promo-modal";
import type { PublicPromotion } from "@/lib/promotions/promotion-service";
import {
  type PromotionThemeOverrides,
  type PromotionThemePreset,
  presetLabel,
  resolvePromotionTheme,
} from "@/lib/promotions/promotion-themes";

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
  imageUrlMobile: string | null;
  backgroundImageUrl: string | null;
  themePreset: PromotionThemePreset;
  themeOverrides: PromotionThemeOverrides;
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

const PRESETS: PromotionThemePreset[] = [
  "OSOOL_DEFAULT",
  "NATIONAL_DAY",
  "RAMADAN",
  "DARK_LUXURY",
  "CUSTOM",
];

const COLOR_FIELDS: { key: keyof PromotionThemeOverrides; label: string }[] = [
  { key: "popupBackground", label: "خلفية النافذة" },
  { key: "textColor", label: "لون العنوان" },
  { key: "subtitleColor", label: "لون الوصف" },
  { key: "primaryCtaBg", label: "خلفية CTA أساسي" },
  { key: "primaryCtaText", label: "نص CTA أساسي" },
  { key: "secondaryCtaBg", label: "خلفية CTA ثانوي" },
  { key: "secondaryCtaText", label: "نص CTA ثانوي" },
  { key: "overlayColor", label: "لون التظليل" },
  { key: "borderColor", label: "لون الإطار" },
  { key: "closeButtonColor", label: "خلفية زر الإغلاق" },
  { key: "closeButtonText", label: "نص زر الإغلاق" },
];

export function AdminPromotionEditor({ initial }: { initial: AdminPromotionForm }) {
  const [form, setForm] = useState(initial);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [localPreviews, setLocalPreviews] = useState<{
    desktop?: string;
    mobile?: string;
    background?: string;
  }>({});

  const previewPromo: PublicPromotion = useMemo(() => {
    const overrides =
      form.themePreset === "CUSTOM"
        ? form.themeOverrides
        : {
            overlayStrength: form.themeOverrides.overlayStrength,
            backgroundPosition: form.themeOverrides.backgroundPosition,
          };
    const theme = resolvePromotionTheme(form.themePreset, overrides);
    if (form.backgroundImageUrl || localPreviews.background) {
      theme.backgroundImageUrl = localPreviews.background ?? form.backgroundImageUrl;
    }
    return {
      id: form.id ?? "preview",
      titleAr: form.titleAr,
      titleEn: form.titleEn,
      subtitleAr: form.subtitleAr || null,
      subtitleEn: form.subtitleEn || null,
      imageUrl: localPreviews.desktop ?? form.imageUrl,
      imageUrlMobile: localPreviews.mobile ?? form.imageUrlMobile,
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
      themePreset: form.themePreset,
      theme,
    };
  }, [form, localPreviews]);

  function setOverride(key: keyof PromotionThemeOverrides, value: string | number) {
    setForm({
      ...form,
      themeOverrides: { ...form.themeOverrides, [key]: value },
    });
  }

  async function save() {
    setMessage(null);
    const payload = {
      ...form,
      themeOverrides:
        form.themePreset === "CUSTOM"
          ? form.themeOverrides
          : {
              overlayStrength: form.themeOverrides.overlayStrength,
              backgroundPosition: form.themeOverrides.backgroundPosition,
            },
    };
    const res = await fetch(form.id ? `/api/admin/promotions/${form.id}` : "/api/admin/promotions", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
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

  async function uploadImage(file: File, slot: "desktop" | "mobile" | "background") {
    if (!form.id) {
      setMessage("احفظ الحملة أولاً ثم ارفع الصورة.");
      return;
    }
    const preview = URL.createObjectURL(file);
    setLocalPreviews((p) => ({ ...p, [slot]: preview }));

    const body = new FormData();
    body.set("file", file);
    body.set("slot", slot);
    const res = await fetch(`/api/admin/promotions/${form.id}/image`, {
      method: "POST",
      body,
      credentials: "include",
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      setMessage(data.error ?? "تعذر رفع الصورة");
      setLocalPreviews((p) => {
        const next = { ...p };
        delete next[slot];
        return next;
      });
      return;
    }
    setLocalPreviews((p) => {
      const next = { ...p };
      delete next[slot];
      return next;
    });
    if (slot === "desktop") setForm({ ...form, imageUrl: data.url });
    else if (slot === "mobile") setForm({ ...form, imageUrlMobile: data.url });
    else setForm({ ...form, backgroundImageUrl: data.url });
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

        <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3 space-y-3">
          <h4 className="font-medium">المظهر (Theme)</h4>
          <label className="text-sm block">
            <span className="mb-1 block">القالب</span>
            <select
              value={form.themePreset}
              onChange={(e) =>
                setForm({
                  ...form,
                  themePreset: e.target.value as PromotionThemePreset,
                })
              }
              className="w-full rounded-xl border border-black/15 px-3 py-2"
            >
              {PRESETS.map((p) => (
                <option key={p} value={p}>
                  {presetLabel(p, "ar")}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm block">
            <span className="mb-1 block">قوة التظليل ({form.themeOverrides.overlayStrength ?? 55}%)</span>
            <input
              type="range"
              min={0}
              max={100}
              value={form.themeOverrides.overlayStrength ?? 55}
              onChange={(e) => setOverride("overlayStrength", Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="text-sm block">
            <span className="mb-1 block">موضع خلفية الحملة</span>
            <select
              value={form.themeOverrides.backgroundPosition ?? "center"}
              onChange={(e) => setOverride("backgroundPosition", e.target.value)}
              className="w-full rounded-xl border border-black/15 px-3 py-2"
            >
              <option value="center">center</option>
              <option value="top">top</option>
              <option value="bottom">bottom</option>
            </select>
          </label>
          {form.themePreset === "CUSTOM" && (
            <div className="grid gap-2 sm:grid-cols-2">
              {COLOR_FIELDS.map(({ key, label }) => (
                <label key={key} className="text-xs flex items-center gap-2">
                  <input
                    type="color"
                    value={String(form.themeOverrides[key] ?? "#000000").slice(0, 7)}
                    onChange={(e) => setOverride(key, e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded border border-black/10"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <PromoImageUpload
          label="صورة الحملة (سطح المكتب)"
          url={localPreviews.desktop ?? form.imageUrl}
          onPick={(f) => uploadImage(f, "desktop")}
        />
        <PromoImageUpload
          label="صورة الحملة (جوال — اختياري)"
          url={localPreviews.mobile ?? form.imageUrlMobile ?? form.imageUrl}
          onPick={(f) => uploadImage(f, "mobile")}
        />
        <PromoImageUpload
          label="صورة خلفية الحملة (اختياري)"
          url={localPreviews.background ?? form.backgroundImageUrl}
          onPick={(f) => uploadImage(f, "background")}
        />

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
                previewMode="desktop"
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
                previewMode="mobile"
                onClose={() => setPreviewOpen(false)}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function PromoImageUpload({
  label,
  url,
  onPick,
}: {
  label: string;
  url: string | null | undefined;
  onPick: (file: File) => void;
}) {
  return (
    <div className="text-sm space-y-2">
      <span className="block font-medium">{label}</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
      {url && (
        <div className="relative h-24 w-40 overflow-hidden rounded-lg bg-black/5">
          <Image src={url} alt="" fill className="object-cover" unoptimized={url.startsWith("blob:")} />
        </div>
      )}
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
