"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { OsoolLogo } from "@/components/brand/osool-logo";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/commerce/cart-provider";
import { useValidatedCart } from "@/components/commerce/use-validated-cart";
import { getPaymentMethods } from "@/lib/commerce/payment";
import { getShippingMethods } from "@/lib/commerce/shipping";
import type { CheckoutInput } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

export function CheckoutPageContent({ locale }: { locale: string }) {
  const localeKey = useLocale() as "ar" | "en";
  const t = useTranslations("commerce.checkout");
  const router = useRouter();
  const { lines, isHydrated, clearCart } = useCart();
  const { cart, loading } = useValidatedCart(lines, isHydrated);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    fullName: "",
    country: "SA",
    city: "",
    district: "",
    street: "",
    buildingNumber: "",
    postalCode: "",
    additionalDetails: "",
    shippingMethodId: "local-dev" as CheckoutInput["shippingMethodId"],
    paymentMethodId: "development-test" as CheckoutInput["paymentMethodId"],
    customerNotes: "",
    acceptTerms: false,
  });

  const shippingMethods = getShippingMethods(form.country);
  const paymentMethods = getPaymentMethods().filter((m) => m.isActive);

  useEffect(() => {
    if (isHydrated && lines.length === 0) router.replace("/cart");
  }, [isHydrated, lines.length, router]);

  if (!isHydrated || loading) {
    return <div className="container-page py-12 text-meta">{t("loading")}</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.canCheckout) {
      setError(t("errors.cartInvalid"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: CheckoutInput = {
        email: form.email,
        phone: form.phone,
        fullName: form.fullName,
        address: {
          fullName: form.fullName,
          phone: form.phone,
          country: form.country,
          city: form.city,
          district: form.district,
          street: form.street,
          buildingNumber: form.buildingNumber,
          postalCode: form.postalCode,
          additionalDetails: form.additionalDetails,
        },
        shippingMethodId: form.shippingMethodId,
        paymentMethodId: form.paymentMethodId,
        customerNotes: form.customerNotes,
        acceptTerms: form.acceptTerms,
        cartLines: lines,
      };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "order_failed");
      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(data.order.orderNumber)}`);
    } catch (err) {
      setError(t(`errors.${err instanceof Error ? err.message : "orderFailed"}` as "errors.orderFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <h1 className="heading-section">{t("title")}</h1>
        <OsoolLogo locale={localeKey} tone="dark" presentation="full" size="checkout" href={false} />
      </div>
      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <Section title={t("customerInfo")}>
            <Field label={t("fullName")} value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
            <Field label={t("email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label={t("phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required placeholder="05XXXXXXXX" />
          </Section>

          <Section title={t("address")}>
            <Field label={t("city")} value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
            <Field label={t("district")} value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
            <Field label={t("street")} value={form.street} onChange={(v) => setForm({ ...form, street: v })} required />
            <Field label={t("buildingNumber")} value={form.buildingNumber} onChange={(v) => setForm({ ...form, buildingNumber: v })} />
            <Field label={t("postalCode")} value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })} />
            <Field label={t("additionalDetails")} value={form.additionalDetails} onChange={(v) => setForm({ ...form, additionalDetails: v })} />
          </Section>

          <Section title={t("shipping")}>
            {shippingMethods.map((m) => (
              <label
                key={m.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors",
                  form.shippingMethodId === m.id ? "border-brand-black-soft bg-surface-muted" : "border-border",
                )}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={form.shippingMethodId === m.id}
                  onChange={() => setForm({ ...form, shippingMethodId: m.id })}
                  className="accent-brand-orange"
                />
                <span className="text-sm">
                  {locale === "ar" ? m.nameAr : m.nameEn} — {formatCurrency(m.price, locale)}
                </span>
              </label>
            ))}
          </Section>

          <Section title={t("payment")}>
            {paymentMethods.map((m) => (
              <label
                key={m.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3.5",
                  m.isActive ? "cursor-pointer" : "opacity-50",
                  form.paymentMethodId === m.id ? "border-brand-black-soft bg-surface-muted" : "border-border",
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  disabled={!m.isActive}
                  checked={form.paymentMethodId === m.id}
                  onChange={() => setForm({ ...form, paymentMethodId: m.id })}
                  className="accent-brand-orange"
                />
                <span className="text-sm">{locale === "ar" ? m.nameAr : m.nameEn}</span>
              </label>
            ))}
            {!paymentMethods.some((m) => m.isActive) && (
              <p className="text-meta">{t("paymentNotActive")}</p>
            )}
          </Section>

          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
              required
              className="mt-0.5 accent-brand-orange"
            />
            <span className="text-text-secondary">{t("acceptTerms")}</span>
          </label>

          {error && (
            <p className="rounded-lg border border-brand-orange/30 bg-brand-orange/5 px-4 py-3 text-sm text-brand-orange">
              {error}
            </p>
          )}
        </div>

        <aside className="card-surface h-fit p-5 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
          <h2 className="mb-4 text-sm font-semibold">{t("orderSummary")}</h2>
          <ul className="mb-4 space-y-2 border-b border-border pb-4 text-sm">
            {cart?.lines.map((l) => (
              <li key={l.variantSku} className="flex justify-between gap-2">
                <span className="line-clamp-1 text-text-secondary">{locale === "ar" ? l.nameAr : l.nameEn}</span>
                <span className="shrink-0 tabular-nums">×{l.quantity}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 text-sm">
            <Row label={t("subtotal")} value={cart ? formatCurrency(cart.subtotal, locale) : "—"} />
            <Row label={t("vat")} value={cart ? formatCurrency(cart.vatTotal, locale) : "—"} />
            <Row label={t("total")} value={cart ? formatCurrency(cart.grandTotal, locale) : "—"} bold />
          </dl>
          <button
            type="submit"
            disabled={submitting || !cart?.canCheckout}
            className="btn-cta mt-6 w-full"
          >
            {submitting ? t("placing") : t("placeOrder")}
          </button>
          {cart?.isDevelopmentMode && (
            <p className="mt-3 text-meta">{t("developmentMode")}</p>
          )}
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-surface p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-meta">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "border-t border-border pt-3 font-semibold")}>
      <dt className={bold ? undefined : "text-text-secondary"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
