import type { Order } from "@/lib/commerce/types";
import { buildOrderTrackingUrl, buildOrderInvoiceUrl } from "@/lib/commerce/order-links";

export type EmailSendResult = { status: "SENT" | "FAILED" | "PENDING"; detail?: string };

export function isEmailProviderConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() || process.env.SMTP_HOST?.trim());
}

function formatMoney(amount: number, locale: "ar" | "en") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export async function sendOrderConfirmationEmail(order: Order, locale: "ar" | "en" = "ar"): Promise<EmailSendResult> {
  const to = order.customerSnapshot?.email ?? order.guestEmail;
  if (!to) return { status: "FAILED", detail: "missing_email" };

  const firstName = order.customerSnapshot?.fullName?.split(" ")[0] ?? "";
  const trackingUrl = buildOrderTrackingUrl(order, locale);
  const invoiceUrl = buildOrderInvoiceUrl(order, locale);

  const subject =
    locale === "ar"
      ? `تم استلام طلبك من اصول التميز — ${order.orderNumber}`
      : `Your Osool Altamaioz order ${order.orderNumber} is confirmed`;

  const html =
    locale === "ar"
      ? `<p>مرحبًا ${firstName || ""}،</p>
<p>شكرًا لطلبك من <strong>اصول التميز</strong>.</p>
<p>رقم الطلب: <strong>${order.orderNumber}</strong></p>
<p>الإجمالي: <strong>${formatMoney(order.grandTotal, "ar")}</strong></p>
<p><a href="${trackingUrl}">تتبع الطلب</a> · <a href="${invoiceUrl}">عرض الفاتورة</a></p>`
      : `<p>Hello ${firstName || ""},</p>
<p>Thank you for shopping with <strong>Osool Altamaioz</strong>.</p>
<p>Order: <strong>${order.orderNumber}</strong></p>
<p>Total: <strong>${formatMoney(order.grandTotal, "en")}</strong></p>
<p><a href="${trackingUrl}">Track order</a> · <a href="${invoiceUrl}">View invoice</a></p>`;

  if (process.env.RESEND_API_KEY) {
    const from = process.env.EMAIL_FROM ?? "orders@osoolaltamaioz.com";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) return { status: "FAILED", detail: `resend_${res.status}` };
    return { status: "SENT" };
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[email:preview]", { to, subject });
    return { status: "PENDING", detail: "email_provider_not_configured" };
  }

  return { status: "FAILED", detail: "email_provider_not_configured" };
}
