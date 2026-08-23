import type { ProductVariant } from "@/lib/catalog/types";

export type PassportKind = "product" | "purchase";

export type PassportSpecRow = {
  keyAr: string;
  keyEn: string;
  valueAr: string;
  valueEn: string;
};

export type PassportPurchaseContext = {
  orderNumber: string;
  purchaseDate: string;
  quantity: number;
};

export type PassportProductCard = {
  slug: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string | null;
  sku: string | null;
  productUrl: string;
  keySpec: string | null;
};

export type PassportDocumentSlot = {
  type: "installation" | "warranty" | "datasheet" | "photometric" | "certificate";
  labelAr: string;
  labelEn: string;
  url?: string;
};

export type PassportData = {
  kind: PassportKind;
  slug: string;
  variantId: string | null;
  nameAr: string;
  nameEn: string;
  imageUrl: string | null;
  sku: string | null;
  modelNumber: string | null;
  variantLabelAr: string | null;
  variantLabelEn: string | null;
  specs: PassportSpecRow[];
  installationType: string | null;
  warrantyTextAr: string | null;
  warrantyTextEn: string | null;
  installationInstructionsAr: string | null;
  installationInstructionsEn: string | null;
  purchase: PassportPurchaseContext | null;
  replacements: PassportProductCard[];
  complementary: PassportProductCard[];
  sceneUrl: string | null;
  supportsScene: boolean;
  variant: ProductVariant | null;
  primaryCategory: string | null;
};

export type ProductPassportTokenPayload = {
  typ: "product";
  slug: string;
  variantId?: string;
};

export type PurchasePassportTokenPayload = {
  typ: "purchase";
  on: string;
  oi: string;
};

export type PassportTokenPayload = ProductPassportTokenPayload | PurchasePassportTokenPayload;
