export type VisualProductType =
  | "chandelier"
  | "spotlight"
  | "pendant"
  | "track"
  | "panel"
  | "strip"
  | "profile"
  | "floodlight"
  | "switch"
  | "unknown";

export type VisualAttributes = {
  productType?: VisualProductType;
  color?: string;
  style?: string;
  finish?: string;
  keywords?: string[];
};

export type VisualMatchProduct = {
  slug: string;
  nameAr: string;
  nameEn: string;
  categorySlug: string;
  score: number;
  reasonAr: string;
  reasonEn: string;
  imageUrl: string | null;
  sku: string | null;
};

export type VisualSearchMode = "vision" | "fallback";

export type VisualSearchResult = {
  mode: VisualSearchMode;
  attributes: VisualAttributes;
  products: VisualMatchProduct[];
  needsClarification: boolean;
  clarificationField?: "type" | "color" | "style";
  confidence: "high" | "medium" | "low";
};

export type VisualSearchRequest = {
  locale: "ar" | "en";
  query?: string;
  attributes?: VisualAttributes;
  imageBuffer?: Buffer;
  imageMime?: string;
};

export const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
