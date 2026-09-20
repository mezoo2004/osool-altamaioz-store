import type { Order } from "@/lib/commerce/types";
import { buildOrderTrackingUrl } from "@/lib/commerce/order-links";
import { normalizeSaudiPhone } from "@/lib/commerce/validation";

export type WhatsAppSendResult = { status: "SENT" | "FAILED" | "PENDING"; detail?: string };

export function isWhatsAppProviderConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim(),
  );
}

function toE164Saudi(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const normalized = normalizeSaudiPhone(phone);
  const digits = normalized.replace(/\D/g, "");
  if (digits.startsWith("966") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("05") && digits.length === 10) return `+966${digits.slice(1)}`;
  if (digits.startsWith("5") && digits.length === 9) return `+966${digits}`;
  return null;
}

export async function sendOrderConfirmationWhatsApp(order: Order): Promise<WhatsAppSendResult> {
  const phone = toE164Saudi(order.customerSnapshot?.phone ?? order.guestPhone);
  if (!phone) return { status: "FAILED", detail: "invalid_phone" };

  const trackingUrl = buildOrderTrackingUrl(order, "ar");
  const body = `شكرًا لطلبك من اصول التميز 🤍
تم استلام طلبك رقم ${order.orderNumber} بنجاح.

إجمالي الطلب: ${order.grandTotal.toFixed(2)} SAR
تتبع طلبك: ${trackingUrl}`;

  if (!isWhatsAppProviderConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.info("[whatsapp:preview]", { phone, bodyLength: body.length });
    }
    return { status: "PENDING", detail: "whatsapp_not_configured" };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone.replace("+", ""),
      type: "text",
      text: { body },
    }),
  });

  if (!res.ok) return { status: "FAILED", detail: `whatsapp_${res.status}` };
  return { status: "SENT" };
}
