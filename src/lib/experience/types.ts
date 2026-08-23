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

export type WallColorTone =
  | "very_light"
  | "beige"
  | "light_gray"
  | "dark_gray"
  | "warm_tones"
  | "unsure";

export type InteriorStyle = "light" | "balanced" | "dark";
export type NaturalLightLevel = "low" | "medium" | "high";
export type BrightnessPreference = "soft" | "standard" | "bright";
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";
export type LightingLayerKind = "general" | "task" | "accent" | "decorative" | "ambient";

export type LightingExperienceInput = {
  spaceSlug: string;
  length: number;
  width: number;
  height: number;
  mood: MoodId;
  cct: CctChoice;
  wallColor: WallColorTone;
  ceilingColor?: WallColorTone;
  interiorStyle?: InteriorStyle;
  naturalLight?: NaturalLightLevel;
  brightnessPreference?: BrightnessPreference;
};

export type RecommendationApproach = {
  summaryAr: string;
  summaryEn: string;
  estimatedLuxTarget: number;
  wallImpactAr: string;
  wallImpactEn: string;
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
  layer?: LightingLayerKind;
  confidence?: ConfidenceLevel;
  confidenceNoteAr?: string;
  confidenceNoteEn?: string;
  lumensPerFixture?: number | null;
};

export type LayerRecommendation = {
  layer: LightingLayerKind;
  categorySlug: string;
  quantity: number;
  reasonAr: string;
  reasonEn: string;
};

export type LayoutSuggestion = {
  rows: number;
  columns: number;
  spacingM: number;
  wallOffsetM: number;
  notesAr: string;
  notesEn: string;
};

export type LumenCalculationSummary = {
  targetLux: number;
  targetLuxNoteAr: string;
  targetLuxNoteEn: string;
  requiredLumens: number;
  adjustmentFactor: number;
  formulaDescriptionAr: string;
  formulaDescriptionEn: string;
  volume: number;
};

export type LightingRecommendationResult = {
  schemaVersion: 2;
  spaceSlug: string;
  area: number;
  mood: MoodId;
  cct: CctChoice;
  wallColor: WallColorTone;
  ceilingColor?: WallColorTone;
  interiorStyle?: InteriorStyle;
  naturalLight?: NaturalLightLevel;
  brightnessPreference?: BrightnessPreference;
  explanationAr: string;
  explanationEn: string;
  explanationsAr: string[];
  explanationsEn: string[];
  approach: RecommendationApproach;
  calculation: LumenCalculationSummary;
  layers: LayerRecommendation[];
  layout: LayoutSuggestion;
  confidence: ConfidenceLevel;
  confidenceNotesAr: string[];
  confidenceNotesEn: string[];
  categories: RecommendationCategory[];
  items: RecommendationItem[];
  dimensions: { length: number; width: number; height: number };
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
