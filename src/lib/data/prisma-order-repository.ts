import type { CheckoutInput, Order, OrderStatus, FulfillmentStatus } from "@/lib/commerce/types";
import { validateCart } from "@/lib/commerce/cart-service";
import {
  calculateTotals,
  generateGuestLookupToken,
  generateOrderNumber,
} from "@/lib/commerce/pricing";
import { getPaymentMethod } from "@/lib/commerce/payment";
import { getShippingMethod } from "@/lib/commerce/shipping";
import { checkoutSchema, normalizeSaudiPhone } from "@/lib/commerce/validation";
import type { OrderRepository } from "@/lib/data/order-repository";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type StoredOrderMeta = {
  guestLookupToken?: string | null;
  fulfillmentStatus?: FulfillmentStatus;
  orderStatus?: OrderStatus;
  shippingMethodId?: string;
  customerNotes?: string | null;
  isDevelopmentOrder?: boolean;
  customerSnapshot?: Order["customerSnapshot"];
};

function mapPrismaOrderStatus(status: OrderStatus): "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" {
  switch (status) {
    case "PENDING_PAYMENT":
      return "PENDING";
    case "PAID":
      return "CONFIRMED";
    case "PROCESSING":
    case "READY_FOR_SHIPMENT":
      return "PROCESSING";
    case "SHIPPED":
      return "SHIPPED";
    case "DELIVERED":
      return "DELIVERED";
    case "CANCELLED":
      return "CANCELLED";
    case "REFUNDED":
      return "REFUNDED";
    default:
      return "PENDING";
  }
}

function mapDbOrderToCommerce(row: {
  id: string;
  orderNumber: string;
  customerId: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  status: string;
  paymentStatus: string;
  subtotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  shippingTotal: Prisma.Decimal;
  vatTotal: Prisma.Decimal;
  grandTotal: Prisma.Decimal;
  currency: string;
  shippingAddress: unknown;
  paymentMethod: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: {
    productId: string | null;
    variantId: string | null;
    skuSnapshot: string;
    nameArSnapshot: string;
    nameEnSnapshot: string;
    attributesSnapshot: unknown;
    imageUrlSnapshot: string | null;
    unitPrice: Prisma.Decimal;
    quantity: number;
    lineTotal: Prisma.Decimal;
  }[];
}): Order {
  const shipping = row.shippingAddress as AddressWithMeta;
  const meta = shipping._orderMeta ?? {};

  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customerId: row.customerId,
    guestEmail: row.guestEmail,
    guestPhone: row.guestPhone,
    guestLookupToken: meta.guestLookupToken ?? null,
    customerSnapshot: meta.customerSnapshot ?? {
      fullName: "",
      email: row.guestEmail ?? "",
      phone: row.guestPhone ?? "",
    },
    shippingAddress: stripOrderMeta(shipping),
    items: row.items.map((item) => {
      const attrs = (item.attributesSnapshot ?? {}) as Record<string, string | null>;
      return {
        productId: item.productId ?? "",
        variantId: item.variantId ?? "",
        productSlug: attrs.productSlug ?? "",
        sku: item.skuSnapshot,
        nameAr: item.nameArSnapshot,
        nameEn: item.nameEnSnapshot,
        cct: attrs.cct ?? null,
        wattage: attrs.wattage ?? null,
        finish: attrs.finish ?? null,
        size: attrs.size ?? null,
        series: attrs.series ?? null,
        modelNumber: attrs.modelNumber ?? null,
        imageUrl: item.imageUrlSnapshot,
        unitPrice: item.unitPrice.toNumber(),
        quantity: item.quantity,
        lineTotal: item.lineTotal.toNumber(),
        priceState: (attrs.priceState as Order["items"][0]["priceState"]) ?? "CONFIRMED",
      };
    }),
    subtotal: row.subtotal.toNumber(),
    discountTotal: row.discountTotal.toNumber(),
    shippingTotal: row.shippingTotal.toNumber(),
    vatTotal: row.vatTotal.toNumber(),
    grandTotal: row.grandTotal.toNumber(),
    currency: "SAR",
    paymentMethod: (row.paymentMethod ?? "development-test") as Order["paymentMethod"],
    paymentStatus: row.paymentStatus as Order["paymentStatus"],
    fulfillmentStatus: meta.fulfillmentStatus ?? "UNFULFILLED",
    orderStatus: meta.orderStatus ?? "PENDING_PAYMENT",
    shippingMethodId: (meta.shippingMethodId ?? "local-dev") as Order["shippingMethodId"],
    customerNotes: meta.customerNotes ?? null,
    trackingNumber: row.trackingNumber,
    trackingUrl: row.trackingUrl,
    isDevelopmentOrder: meta.isDevelopmentOrder ?? false,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

type AddressWithMeta = Order["shippingAddress"] & { _orderMeta?: StoredOrderMeta };

function stripOrderMeta(address: AddressWithMeta): Order["shippingAddress"] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- omit internal meta from customer-facing address
  const { _orderMeta, ...rest } = address;
  return rest;
}

export class PrismaOrderRepository implements OrderRepository {
  async createFromCheckout(input: CheckoutInput, customerId: string | null = null): Promise<Order> {
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "validation_failed");
    }

    const data = parsed.data;
    const validated = await validateCart(data.cartLines);

    if (!validated.canCheckout) {
      if (validated.hasPriceUnavailable && !validated.isDevelopmentMode) throw new Error("price_unavailable");
      if (validated.hasStockIssues) throw new Error("stock_unavailable");
      throw new Error("cart_invalid");
    }

    const payment = getPaymentMethod(data.paymentMethodId);
    if (!payment?.isActive) throw new Error("payment_unavailable");

    const shipping = getShippingMethod(data.shippingMethodId);
    if (!shipping) throw new Error("shipping_unavailable");

    const totals = calculateTotals({
      lines: validated.lines.map((l) => ({ lineTotal: l.lineTotal ?? 0 })),
      shippingTotal: shipping.price,
    });

    const isDevelopmentOrder =
      process.env.DEVELOPMENT_CHECKOUT_MODE === "true" || payment.isDevelopment;

    const orderNumber = generateOrderNumber();
    const guestLookupToken = customerId ? null : generateGuestLookupToken();
    const orderStatus: OrderStatus = isDevelopmentOrder ? "PROCESSING" : "PENDING_PAYMENT";

    const shippingAddress: AddressWithMeta = {
      ...data.address,
      _orderMeta: {
        guestLookupToken,
        fulfillmentStatus: "UNFULFILLED",
        orderStatus,
        shippingMethodId: data.shippingMethodId,
        customerNotes: data.customerNotes ?? null,
        isDevelopmentOrder,
        customerSnapshot: {
          fullName: data.fullName,
          email: data.email,
          phone: normalizeSaudiPhone(data.phone),
        },
      },
    };

    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          guestEmail: customerId ? null : data.email.toLowerCase(),
          guestPhone: customerId ? null : normalizeSaudiPhone(data.phone),
          status: mapPrismaOrderStatus(orderStatus),
          paymentStatus: isDevelopmentOrder ? "PAID" : "PENDING",
          subtotal: totals.subtotal,
          discountTotal: totals.discountTotal,
          shippingTotal: totals.shippingTotal,
          vatTotal: totals.vatTotal,
          grandTotal: totals.grandTotal,
          currency: "SAR",
          shippingAddress,
          paymentMethod: data.paymentMethodId,
          items: {
            create: validated.lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              skuSnapshot: l.variantSku,
              nameArSnapshot: l.nameAr,
              nameEnSnapshot: l.nameEn,
              attributesSnapshot: {
                cct: l.cct,
                wattage: l.wattage,
                finish: l.finish,
                size: l.size,
                series: l.series,
                modelNumber: l.modelNumber,
                productSlug: l.productSlug,
                priceState: l.priceState,
              },
              imageUrlSnapshot: l.imageUrl,
              unitPrice: l.unitPrice ?? 0,
              quantity: l.quantity,
              lineTotal: l.lineTotal ?? 0,
            })),
          },
        },
        include: { items: true },
      });

      return order;
    });

    return mapDbOrderToCommerce(created);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const row = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    return row ? mapDbOrderToCommerce(row) : null;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const rows = await prisma.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapDbOrderToCommerce);
  }

  async findGuestOrder(orderNumber: string, email: string): Promise<Order | null> {
    const order = await this.findByOrderNumber(orderNumber);
    if (!order || order.customerId) return null;
    if (order.guestEmail?.toLowerCase() !== email.toLowerCase()) return null;
    return order;
  }
}
