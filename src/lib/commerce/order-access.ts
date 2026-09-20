import type { Order } from "@/lib/commerce/types";
import { getOrderRepository } from "@/lib/data/order-repository";
import { getSessionUser } from "@/lib/data/user-repository";

export async function canAccessOrder(
  order: Order,
  opts: { email?: string | null; token?: string | null; customerId?: string | null },
): Promise<boolean> {
  if (opts.customerId && order.customerId === opts.customerId) return true;
  if (order.guestLookupToken && opts.token && order.guestLookupToken === opts.token) return true;
  const email = opts.email?.toLowerCase();
  if (email && order.guestEmail?.toLowerCase() === email) return true;
  if (email && order.customerSnapshot?.email.toLowerCase() === email) return true;
  return false;
}

export async function findOrderForGuestAccess(
  orderNumber: string,
  email: string,
  token?: string | null,
): Promise<Order | null> {
  const order = await getOrderRepository().findByOrderNumber(orderNumber);
  if (!order) return null;
  const ok = await canAccessOrder(order, { email, token });
  return ok ? order : null;
}

export async function findOrderForSuccessPage(
  orderNumber: string,
  opts: { email?: string | null; token?: string | null },
): Promise<Order | null> {
  if (!orderNumber) return null;
  const user = await getSessionUser();
  const order = await getOrderRepository().findByOrderNumber(orderNumber);
  if (!order) return null;
  const ok = await canAccessOrder(order, {
    email: opts.email ?? user?.email,
    token: opts.token,
    customerId: user?.id,
  });
  return ok ? order : null;
}
