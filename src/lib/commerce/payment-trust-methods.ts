export type PaymentTrustMethodId =
  | "stc-pay"
  | "google-pay"
  | "apple-pay"
  | "mada"
  | "bank-transfer"
  | "visa"
  | "mastercard"
  | "tamara"
  | "tabby";

export type PaymentTrustMethod = {
  id: PaymentTrustMethodId;
  /** Checkout activation is separate — trust section may show planned methods. */
  displayStatus: "ACTIVE" | "PLANNED";
  presentation: "logo" | "bank-transfer";
  logoSrc?: string;
  /** Tailwind classes for optical balance inside the fixed logo slot. */
  logoClassName?: string;
  nameAr: string;
  nameEn: string;
};

export function getPaymentTrustMethods(): PaymentTrustMethod[] {
  return [
    {
      id: "stc-pay",
      displayStatus: "PLANNED",
      presentation: "logo",
      logoSrc: "/brand/payments/stc-pay.svg",
      logoClassName: "h-[2.75rem] w-auto max-w-[4.85rem]",
      nameAr: "STC Pay",
      nameEn: "STC Pay",
    },
    {
      id: "google-pay",
      displayStatus: "PLANNED",
      presentation: "logo",
      logoSrc: "/brand/payments/google-pay.svg",
      logoClassName: "h-[2.65rem] w-auto max-w-[4.65rem]",
      nameAr: "Google Pay",
      nameEn: "Google Pay",
    },
    {
      id: "apple-pay",
      displayStatus: "PLANNED",
      presentation: "logo",
      logoSrc: "/brand/payments/apple-pay.svg",
      logoClassName: "h-[2.5rem] w-auto max-w-[5.15rem]",
      nameAr: "Apple Pay",
      nameEn: "Apple Pay",
    },
    {
      id: "mada",
      displayStatus: "PLANNED",
      presentation: "logo",
      logoSrc: "/brand/payments/mada.svg",
      logoClassName: "h-[2.75rem] w-auto max-w-[4.75rem]",
      nameAr: "مدى",
      nameEn: "mada",
    },
    {
      id: "bank-transfer",
      displayStatus: "PLANNED",
      presentation: "bank-transfer",
      nameAr: "تحويل بنكي",
      nameEn: "Bank Transfer",
    },
    {
      id: "visa",
      displayStatus: "PLANNED",
      presentation: "logo",
      logoSrc: "/brand/payments/visa.svg",
      logoClassName: "h-[2.75rem] w-auto max-w-[4.25rem]",
      nameAr: "Visa",
      nameEn: "Visa",
    },
    {
      id: "mastercard",
      displayStatus: "PLANNED",
      presentation: "logo",
      logoSrc: "/brand/payments/mastercard.svg",
      logoClassName: "h-[2.875rem] w-auto max-w-[5rem]",
      nameAr: "Mastercard",
      nameEn: "Mastercard",
    },
    {
      id: "tamara",
      displayStatus: "PLANNED",
      presentation: "logo",
      logoSrc: "/brand/payments/tamara.svg",
      logoClassName: "w-[5.15rem] max-w-[78%] h-auto max-h-[2.875rem]",
      nameAr: "تمارا",
      nameEn: "Tamara",
    },
    {
      id: "tabby",
      displayStatus: "PLANNED",
      presentation: "logo",
      logoSrc: "/brand/payments/tabby.svg",
      logoClassName: "h-[2.65rem] w-auto max-w-[4.85rem]",
      nameAr: "تابي",
      nameEn: "Tabby",
    },
  ];
}
