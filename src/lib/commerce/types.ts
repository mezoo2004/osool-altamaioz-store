export type PriceState = "CONFIRMED" | "PRICE_UNAVAILABLE" | "DEMO";

export type CartLineInput = {
  productId: string;
  productSlug: string;
  variantId: string;
  variantSku: string;
  quantity: number;
};

export type CartLine = CartLineInput & {
  nameAr: string;
  nameEn: string;
  cct: string | null;
  wattage: string | null;
  finish: string | null;
  size: string | null;
  imageUrl: string | null;
  series: string | null;
  modelNumber: string | null;
  priceState: PriceState;
  unitPrice: number | null;
  lineTotal: number | null;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER";
  stockQty: number;
  isPurchasable: boolean;
  issues: string[];
};

export type ValidatedCart = {
  lines: CartLine[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  vatTotal: number;
  grandTotal: number;
  currency: "SAR";
  hasPriceUnavailable: boolean;
  hasStockIssues: boolean;
  canCheckout: boolean;
  isDevelopmentMode: boolean;
};

export type AddressInput = {
  label?: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  district?: string;
  street: string;
  buildingNumber?: string;
  postalCode?: string;
  additionalDetails?: string;
};

export type Address = AddressInput & {
  id: string;
  customerId: string;
  isDefault: boolean;
};

export type ShippingMethodId =
  | "local-dev"
  | "saudi-dev"
  | "gcc-dev"
  | "international-dev";

export type ShippingMethod = {
  id: ShippingMethodId;
  nameAr: string;
  nameEn: string;
  price: number;
  isDevelopment: boolean;
};

export type PaymentMethodId =
  | "card-placeholder"
  | "mada-placeholder"
  | "apple-pay-placeholder"
  | "tabby-placeholder"
  | "tamara-placeholder"
  | "development-test";

export type PaymentMethod = {
  id: PaymentMethodId;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  isDevelopment: boolean;
};

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "READY_FOR_SHIPMENT"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";

export type FulfillmentStatus =
  | "UNFULFILLED"
  | "PROCESSING"
  | "READY"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderItemSnapshot = {
  id: string;
  productId: string;
  variantId: string;
  productSlug: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  cct: string | null;
  wattage: string | null;
  finish: string | null;
  size: string | null;
  series: string | null;
  modelNumber: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  priceState: PriceState;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  guestLookupToken: string | null;
  customerSnapshot: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: AddressInput;
  billingAddress?: AddressInput | null;
  items: OrderItemSnapshot[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  vatTotal: number;
  grandTotal: number;
  currency: "SAR";
  paymentMethod: PaymentMethodId;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  orderStatus: OrderStatus;
  shippingMethodId: ShippingMethodId;
  customerNotes?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrier?: string | null;
  isDevelopmentOrder: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  locale: string;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
};

export type CheckoutInput = {
  email: string;
  phone: string;
  fullName: string;
  address: AddressInput;
  shippingMethodId: ShippingMethodId;
  paymentMethodId: PaymentMethodId;
  customerNotes?: string;
  acceptTerms: boolean;
  cartLines: CartLineInput[];
};
