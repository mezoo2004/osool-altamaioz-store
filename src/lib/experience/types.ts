export type SpaceRecord = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  descriptionAr: string;
  descriptionEn: string;
  heroImage: string;
  mobileHeroImage?: string;
  recommendedCategorySlugs: string[];
  recommendedProductSlugs: string[];
  tipsAr: string[];
  tipsEn: string[];
  sceneIds: string[];
  featured: boolean;
  sortOrder: number;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
};

export type SceneHotspotRecord = {
  id: string;
  sceneId: string;
  x: number;
  y: number;
  labelAr: string;
  labelEn: string;
  productSlug: string;
  variantId?: string;
};

export type SceneItemRecord = {
  productSlug: string;
  variantId?: string;
  quantity: number;
  sortOrder: number;
  required?: boolean;
};

export type SceneRecord = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  spaceId: string;
  heroImage: string;
  mobileImage?: string;
  hotspots: SceneHotspotRecord[];
  items: SceneItemRecord[];
  featured: boolean;
  sortOrder: number;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescriptionAr: string;
  seoDescriptionEn: string;
};

export type MoodId =
  | "warm"
  | "luxury"
  | "modern"
  | "relaxed"
  | "minimal"
  | "hotel"
  | "dramatic"
  | "functional";

export type CctChoice = "3000K" | "4000K" | "6500K";

export type LightingExperienceInput = {
  spaceSlug: string;
  length: number;
  width: number;
  height: number;
  mood: MoodId;
  cct: CctChoice;
};

export type RecommendationCategory = {
  slug: string;
  nameAr: string;
  nameEn: string;
  reasonAr: string;
  reasonEn: string;
};

export type RecommendationItem = {
  productSlug: string;
  variantId?: string;
  quantity: number;
  reasonAr: string;
  reasonEn: string;
  categorySlug?: string;
  suggestedWattage?: string;
};

export type LightingRecommendationResult = {
  spaceSlug: string;
  area: number;
  mood: MoodId;
  cct: CctChoice;
  explanationAr: string;
  explanationEn: string;
  categories: RecommendationCategory[];
  items: RecommendationItem[];
};

export type ResolvedSceneItem = {
  productSlug: string;
  variantId: string;
  variantSku: string;
  productId: string;
  quantity: number;
  sortOrder: number;
  required: boolean;
  nameAr: string;
  nameEn: string;
  imageUrl: string | null;
  cct: string | null;
  wattage: string | null;
  stockStatus: string;
  isPurchasable: boolean;
  issues: string[];
};

export type SceneBundleValidation = {
  available: ResolvedSceneItem[];
  unavailable: ResolvedSceneItem[];
  allAvailable: boolean;
};
