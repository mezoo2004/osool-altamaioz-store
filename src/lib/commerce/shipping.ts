import type { ShippingMethod, ShippingMethodId } from "@/lib/commerce/types";

const METHODS: ShippingMethod[] = [
  {
    id: "local-dev",
    nameAr: "توصيل محلي (تجريبي)",
    nameEn: "Local delivery (development)",
    price: 25,
    isDevelopment: true,
  },
  {
    id: "saudi-dev",
    nameAr: "شحن داخل السعودية (تجريبي)",
    nameEn: "Saudi shipping (development)",
    price: 45,
    isDevelopment: true,
  },
  {
    id: "gcc-dev",
    nameAr: "شحن خليجي (تجريبي)",
    nameEn: "GCC shipping (development)",
    price: 85,
    isDevelopment: true,
  },
  {
    id: "international-dev",
    nameAr: "شحن دولي (تجريبي)",
    nameEn: "International shipping (development)",
    price: 120,
    isDevelopment: true,
  },
];

export function getShippingMethods(country = "SA"): ShippingMethod[] {
  if (country === "SA") return METHODS.filter((m) => m.id === "local-dev" || m.id === "saudi-dev");
  if (["AE", "KW", "BH", "OM", "QA"].includes(country))
    return METHODS.filter((m) => m.id === "gcc-dev");
  return METHODS.filter((m) => m.id === "international-dev");
}

export function getShippingMethod(id: ShippingMethodId): ShippingMethod | null {
  return METHODS.find((m) => m.id === id) ?? null;
}
