import type { PaymentMethod, PaymentMethodId } from "@/lib/commerce/types";

function isDevelopmentCheckoutEnabled() {
  return process.env.DEVELOPMENT_CHECKOUT_MODE === "true";
}

export function getPaymentMethods(): PaymentMethod[] {
  const isDev = isDevelopmentCheckoutEnabled();
  return [
    {
      id: "mada-placeholder",
      nameAr: "مدى — غير مفعّل",
      nameEn: "Mada — not activated",
      isActive: false,
      isDevelopment: false,
    },
    {
      id: "card-placeholder",
      nameAr: "Visa / Mastercard — غير مفعّل",
      nameEn: "Visa / Mastercard — not activated",
      isActive: false,
      isDevelopment: false,
    },
    {
      id: "apple-pay-placeholder",
      nameAr: "Apple Pay — غير مفعّل",
      nameEn: "Apple Pay — not activated",
      isActive: false,
      isDevelopment: false,
    },
    {
      id: "tabby-placeholder",
      nameAr: "Tabby — غير مفعّل",
      nameEn: "Tabby — not activated",
      isActive: false,
      isDevelopment: false,
    },
    {
      id: "tamara-placeholder",
      nameAr: "Tamara — غير مفعّل",
      nameEn: "Tamara — not activated",
      isActive: false,
      isDevelopment: false,
    },
    {
      id: "development-test",
      nameAr: "دفع تجريبي — للاختبار فقط",
      nameEn: "Development test payment — testing only",
      isActive: isDev,
      isDevelopment: true,
    },
  ];
}

export function getPaymentMethod(id: PaymentMethodId): PaymentMethod | null {
  return getPaymentMethods().find((m) => m.id === id) ?? null;
}
