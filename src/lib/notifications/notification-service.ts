import type { Order } from "@/lib/commerce/types";
import { sendOrderConfirmationEmail } from "@/lib/notifications/email-provider";
import {
  getNotificationEntry,
  upsertNotificationEntry,
  wasNotificationSent,
} from "@/lib/notifications/notification-log";
import { sendOrderConfirmationWhatsApp } from "@/lib/notifications/whatsapp-provider";

export async function dispatchOrderConfirmedNotifications(order: Order): Promise<void> {
  await Promise.all([dispatchEmail(order), dispatchWhatsApp(order)]);
}

async function dispatchEmail(order: Order) {
  if (wasNotificationSent(order.orderNumber, "email")) return;

  upsertNotificationEntry({
    orderNumber: order.orderNumber,
    channel: "email",
    status: "PENDING",
    updatedAt: new Date().toISOString(),
  });

  try {
    const locale = order.customerSnapshot?.email ? "ar" : "ar";
    const result = await sendOrderConfirmationEmail(order, locale);
    upsertNotificationEntry({
      orderNumber: order.orderNumber,
      channel: "email",
      status: result.status === "SENT" ? "SENT" : result.status === "PENDING" ? "PENDING" : "FAILED",
      updatedAt: new Date().toISOString(),
      detail: result.detail,
    });
  } catch {
    upsertNotificationEntry({
      orderNumber: order.orderNumber,
      channel: "email",
      status: "FAILED",
      updatedAt: new Date().toISOString(),
      detail: "exception",
    });
  }
}

async function dispatchWhatsApp(order: Order) {
  if (wasNotificationSent(order.orderNumber, "whatsapp")) return;

  upsertNotificationEntry({
    orderNumber: order.orderNumber,
    channel: "whatsapp",
    status: "PENDING",
    updatedAt: new Date().toISOString(),
  });

  try {
    const result = await sendOrderConfirmationWhatsApp(order);
    upsertNotificationEntry({
      orderNumber: order.orderNumber,
      channel: "whatsapp",
      status: result.status === "SENT" ? "SENT" : result.status === "PENDING" ? "PENDING" : "FAILED",
      updatedAt: new Date().toISOString(),
      detail: result.detail,
    });
  } catch {
    upsertNotificationEntry({
      orderNumber: order.orderNumber,
      channel: "whatsapp",
      status: "FAILED",
      updatedAt: new Date().toISOString(),
      detail: "exception",
    });
  }
}

export function getOrderNotificationSummary(orderNumber: string) {
  return {
    email: getNotificationEntry(orderNumber, "email"),
    whatsapp: getNotificationEntry(orderNumber, "whatsapp"),
  };
}
