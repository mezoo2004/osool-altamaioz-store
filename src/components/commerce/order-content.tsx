"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { OsoolLogo } from "@/components/brand/osool-logo";
import { Link } from "@/i18n/navigation";
import { AccountPageShell } from "@/components/commerce/account-page-shell";
import { OrderPassportActions } from "@/components/passport/order-passport-actions";
import { EmptyState } from "@/components/ui/empty-state";
import type { Order } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

export function OrderSuccessContent({
  orderNumber,
  order,
  locale,
}: {
  orderNumber: string;
  order: Order | null;
  locale: string;
}) {
  const t = useTranslations("commerce.orderSuccess");
  const localeKey = locale as "ar" | "en";
  const email = order?.customerSnapshot?.email ?? order?.guestEmail ?? "";
  const tokenQuery = order?.guestLookupToken ? `&token=${encodeURIComponent(order.guestLookupToken)}` : "";
  const trackHref = `/track-order?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}${tokenQuery}`;
  const invoiceHref = `/orders/${encodeURIComponent(orderNumber)}/invoice?email=${encodeURIComponent(email)}${tokenQuery}`;

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex justify-center md:justify-start">
          <OsoolLogo locale={localeKey} surface="light" size="checkout" href={false} />
        </div>
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-brand-orange/30 bg-brand-orange/5 text-xl text-brand-orange md:mx-0">
          ✓
        </div>
        <h1 className="heading-section text-center md:text-start">{t("title")}</h1>
        <p className="mt-3 text-center text-meta md:text-start">{t("subtitle")}</p>
        <p className="mt-4 text-center text-lg font-semibold tabular-nums tracking-wide md:text-start">{orderNumber}</p>
        {order && (
          <p className="mt-2 text-center text-sm text-text-secondary md:text-start">
            {t("notificationsHint")}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href={trackHref} className="btn-cta-secondary justify-center">
            {t("track")}
          </Link>
          {order && (
            <Link href={invoiceHref} className="btn-cta-secondary justify-center">
              {t("invoice")}
            </Link>
          )}
          <Link href="/account/orders" className="btn-cta justify-center">
            {t("viewOrders")}
          </Link>
        </div>
        {order && <OrderDetailView order={order} locale={locale} className="mt-10" />}
        <Link href="/categories/indoor" className="mt-6 inline-block text-sm text-brand-orange hover:underline">
          {t("continueShopping")} {locale === "ar" ? "←" : "→"}
        </Link>
      </div>
    </div>
  );
}

export function TrackOrderContent({
  locale,
  initialOrderNumber = "",
  initialEmail = "",
}: {
  locale: string;
  initialOrderNumber?: string;
  initialEmail?: string;
}) {
  const t = useTranslations("commerce.tracking");
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState(initialEmail);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, email }),
    });
    if (!res.ok) {
      setError(t("notFound"));
      setOrder(null);
      return;
    }
    setOrder((await res.json()).order as Order);
  };

  return (
    <div className="container-page max-w-2xl py-8 md:py-12">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="heading-section">{t("title")}</h1>
      </div>
      <form onSubmit={submit} className="card-surface space-y-4 p-5">
        <label className="block text-sm">
          <span className="mb-1.5 block text-meta">{t("orderNumber")}</span>
          <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} required className="input-field" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-meta">{t("email")}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
        </label>
        {error && (
          <p className="rounded-lg border border-brand-orange/30 bg-brand-orange/5 px-3 py-2 text-sm text-brand-orange">
            {error}
          </p>
        )}
        <button type="submit" className="btn-cta w-full">{t("lookup")}</button>
      </form>
      {order && <OrderDetailView order={order} locale={locale} className="mt-8" />}
    </div>
  );
}

export function OrderDetailView({
  order,
  locale,
  className,
}: {
  order: Order;
  locale: string;
  className?: string;
}) {
  const t = useTranslations("commerce.orders");
  const statusKey = order.orderStatus.toLowerCase().replace(/_/g, "-");

  const localeKey = locale as "ar" | "en";
  return (
    <div className={cn("card-surface space-y-6 p-5 md:p-6", className)}>
      <div className="flex justify-end border-b border-border pb-4">
        <OsoolLogo locale={localeKey} surface="light" size="checkout" href={false} />
      </div>
      <div className="flex flex-wrap justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-meta">{t("orderNumber")}</p>
          <p className="font-semibold tabular-nums">{order.orderNumber}</p>
        </div>
        <div className="text-end">
          <p className="text-meta">{t("status")}</p>
          <StatusBadge label={t(`statuses.${statusKey}` as "statuses.pending-payment")} />
        </div>
      </div>
      <OrderTimeline order={order} />
      <ul className="divide-y divide-border">
        {order.items.map((item) => (
          <li key={item.id || item.sku} className="py-3 text-sm">
            <div className="flex justify-between gap-4">
              <span>{locale === "ar" ? item.nameAr : item.nameEn} × {item.quantity}</span>
              <span className="shrink-0 tabular-nums">{formatCurrency(item.lineTotal, locale)}</span>
            </div>
            <OrderPassportActions
              orderNumber={order.orderNumber}
              item={item}
              locale={locale as "ar" | "en"}
            />
          </li>
        ))}
      </ul>
      <dl className="space-y-2 border-t border-border pt-4 text-sm">
        <Row label={t("subtotal")} value={formatCurrency(order.subtotal, locale)} />
        <Row label={t("shipping")} value={formatCurrency(order.shippingTotal, locale)} />
        <Row label={t("vat")} value={formatCurrency(order.vatTotal, locale)} />
        <Row label={t("total")} value={formatCurrency(order.grandTotal, locale)} bold />
      </dl>
      {order.isDevelopmentOrder && (
        <p className="rounded-lg bg-surface-muted px-3 py-2 text-xs text-text-secondary">{t("developmentOrder")}</p>
      )}
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md bg-brand-black-soft px-2 py-0.5 text-xs font-medium text-white">
      {label}
    </span>
  );
}

function OrderTimeline({ order }: { order: Order }) {
  const t = useTranslations("commerce.tracking");
  const steps = ["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "DELIVERED"];
  const current = steps.indexOf(order.orderStatus) >= 0 ? steps.indexOf(order.orderStatus) : 1;

  return (
    <ol className="grid gap-2 sm:grid-cols-4">
      {steps.map((step, i) => (
        <li
          key={step}
          className={cn(
            "rounded-lg border px-3 py-2.5 text-xs break-words",
            i <= current
              ? "border-brand-black-soft bg-brand-black-soft/5 font-medium text-text-primary"
              : "border-border text-text-secondary",
          )}
        >
          <span className="mb-0.5 block text-[10px] tabular-nums text-text-secondary">{i + 1}</span>
          {t(`steps.${step}` as "steps.PENDING_PAYMENT")}
        </li>
      ))}
    </ol>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "pt-2 font-semibold")}>
      <dt className={bold ? undefined : "text-text-secondary"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export function OrdersListContent({ locale, orders }: { locale: string; orders: Order[] }) {
  const t = useTranslations("commerce.orders");

  if (!orders.length) {
    return (
      <AccountPageShell locale={locale} title={t("title")} active="orders">
        <EmptyState
          title={t("empty")}
          action={{ label: locale === "ar" ? "تسوق الآن" : "Shop now", href: "/categories/indoor" }}
        />
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell locale={locale} title={t("title")} active="orders">
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/account/orders/${order.orderNumber}`}
              className="card-surface flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-brand-gray/50"
            >
              <div>
                <p className="font-medium tabular-nums">{order.orderNumber}</p>
                <p className="text-meta">
                  {new Date(order.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-SA")}
                </p>
              </div>
              <div className="text-end">
                <p className="text-price">{formatCurrency(order.grandTotal, locale)}</p>
                <p className="text-meta">{order.items.length} {t("items")}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AccountPageShell>
  );
}
