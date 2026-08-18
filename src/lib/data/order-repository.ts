import fs from "node:fs";
import path from "node:path";
import type { CheckoutInput, Order } from "@/lib/commerce/types";
import { validateCart } from "@/lib/commerce/cart-service";
import {
  calculateTotals,
  generateGuestLookupToken,
  generateOrderNumber,
} from "@/lib/commerce/pricing";
import { getPaymentMethod } from "@/lib/commerce/payment";
import { getShippingMethod } from "@/lib/commerce/shipping";
import { checkoutSchema, normalizeSaudiPhone } from "@/lib/commerce/validation";
import { requiresDatabaseStorage } from "@/lib/data/database-config";
import { PrismaOrderRepository } from "@/lib/data/prisma-order-repository";

const STORE_DIR = path.join(process.cwd(), "data", "store");
const ORDERS_FILE = path.join(STORE_DIR, "orders.json");

function ensureStore() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
}

function readOrders(): Order[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8")) as Order[];
}

function writeOrders(orders: Order[]) {
  ensureStore();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export interface OrderRepository {
  createFromCheckout(input: CheckoutInput, customerId?: string | null): Promise<Order>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  findGuestOrder(orderNumber: string, email: string): Promise<Order | null>;
}

export class FileOrderRepository implements OrderRepository {
  async createFromCheckout(input: CheckoutInput, customerId: string | null = null): Promise<Order> {
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "validation_failed");
    }

    const data = parsed.data;
    const validated = await validateCart(data.cartLines);

    if (!validated.canCheckout) {
      if (validated.hasPriceUnavailable && !validated.isDevelopmentMode) {
        throw new Error("price_unavailable");
      }
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

    const now = new Date().toISOString();
    const isDevelopmentOrder =
      process.env.DEVELOPMENT_CHECKOUT_MODE === "true" || payment.isDevelopment;

    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber: generateOrderNumber(),
      customerId,
      guestEmail: customerId ? null : data.email,
      guestPhone: customerId ? null : normalizeSaudiPhone(data.phone),
      guestLookupToken: customerId ? null : generateGuestLookupToken(),
      customerSnapshot: {
        fullName: data.fullName,
        email: data.email,
        phone: normalizeSaudiPhone(data.phone),
      },
      shippingAddress: data.address,
      items: validated.lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        productSlug: l.productSlug,
        sku: l.variantSku,
        nameAr: l.nameAr,
        nameEn: l.nameEn,
        cct: l.cct,
        wattage: l.wattage,
        finish: l.finish,
        size: l.size,
        series: l.series,
        modelNumber: l.modelNumber,
        imageUrl: l.imageUrl,
        unitPrice: l.unitPrice ?? 0,
        quantity: l.quantity,
        lineTotal: l.lineTotal ?? 0,
        priceState: l.priceState,
      })),
      ...totals,
      currency: "SAR",
      paymentMethod: data.paymentMethodId,
      paymentStatus: isDevelopmentOrder ? "PAID" : "PENDING",
      fulfillmentStatus: "UNFULFILLED",
      orderStatus: isDevelopmentOrder ? "PROCESSING" : "PENDING_PAYMENT",
      shippingMethodId: data.shippingMethodId,
      customerNotes: data.customerNotes ?? null,
      isDevelopmentOrder,
      createdAt: now,
      updatedAt: now,
    };

    const orders = readOrders();
    orders.unshift(order);
    writeOrders(orders);
    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return readOrders().find((o) => o.orderNumber === orderNumber) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return readOrders().filter((o) => o.customerId === customerId);
  }

  async findGuestOrder(orderNumber: string, email: string): Promise<Order | null> {
    const order = await this.findByOrderNumber(orderNumber);
    if (!order || order.customerId) return null;
    if (order.guestEmail?.toLowerCase() !== email.toLowerCase()) return null;
    return order;
  }
}

let orderRepository: OrderRepository | null = null;
let prismaOrderRepository: PrismaOrderRepository | null = null;

export function getOrderRepository(): OrderRepository {
  if (requiresDatabaseStorage()) {
    if (!prismaOrderRepository) prismaOrderRepository = new PrismaOrderRepository();
    return prismaOrderRepository;
  }
  if (!orderRepository) orderRepository = new FileOrderRepository();
  return orderRepository;
}
