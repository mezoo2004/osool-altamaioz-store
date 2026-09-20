"use client";

import { useTranslations } from "next-intl";
import { OsoolLogo } from "@/components/brand/osool-logo";
import { Link } from "@/i18n/navigation";
import type { Order } from "@/lib/commerce/types";
import { formatCurrency } from "@/lib/utils";

export function OrderInvoiceContent({ order, locale }: { order: Order; locale: string }) {
  const t = useTranslations("commerce.invoice");
  const localeKey = locale as "ar" | "en";

  return (
    <div className="container-page py-8 md:py-12 print:py-4">
      <div className="mx-auto max-w-3xl card-surface space-y-6 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-meta">{t("title")}</p>
            <h1 className="heading-section mt-1 tabular-nums">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-text-secondary">
              {new Date(order.createdAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-SA")}
            </p>
          </div>
          <OsoolLogo locale={localeKey} surface="light" size="checkout" href={false} />
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-meta">{t("customer")}</p>
            <p className="font-medium">{order.customerSnapshot?.fullName}</p>
            <p className="text-text-secondary">{order.customerSnapshot?.email}</p>
            <p className="text-text-secondary">{order.customerSnapshot?.phone}</p>
          </div>
          <div>
            <p className="text-meta">{t("shippingAddress")}</p>
            <p>{order.shippingAddress.street}</p>
            {order.shippingAddress.district && <p>{order.shippingAddress.district}</p>}
            <p>
              {order.shippingAddress.city}
              {order.shippingAddress.country ? `, ${order.shippingAddress.country}` : ""}
            </p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-start text-meta">
              <th className="py-2">{t("item")}</th>
              <th className="py-2">{t("sku")}</th>
              <th className="py-2">{t("qty")}</th>
              <th className="py-2 text-end">{t("total")}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id || item.sku} className="border-b border-border/60">
                <td className="py-3 pe-2">{locale === "ar" ? item.nameAr : item.nameEn}</td>
                <td className="py-3 tabular-nums text-text-secondary">{item.sku}</td>
                <td className="py-3 tabular-nums">{item.quantity}</td>
                <td className="py-3 text-end tabular-nums">{formatCurrency(item.lineTotal, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ms-auto max-w-xs space-y-2 text-sm">
          <Row label={t("subtotal")} value={formatCurrency(order.subtotal, locale)} />
          <Row label={t("shipping")} value={formatCurrency(order.shippingTotal, locale)} />
          <Row label={t("vat")} value={formatCurrency(order.vatTotal, locale)} />
          <Row label={t("grandTotal")} value={formatCurrency(order.grandTotal, locale)} bold />
        </dl>

        <div className="flex flex-wrap gap-3 border-t border-border pt-6 print:hidden">
          <Link href={`/track-order?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.customerSnapshot?.email ?? "")}`} className="btn-cta-secondary">
            {t("track")}
          </Link>
          <button type="button" onClick={() => window.print()} className="btn-cta">
            {t("print")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${bold ? "pt-2 font-semibold" : ""}`}>
      <dt className={bold ? undefined : "text-text-secondary"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
