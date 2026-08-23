import type {
  BrightnessPreference,
  CctChoice,
  ConfidenceLevel,
  LightingLayerKind,
  LightingRecommendationResult,
  MoodId,
  NaturalLightLevel,
  WallColorTone,
} from "@/lib/experience/types";
import type { VisualAttributes, VisualSearchResult } from "@/lib/visual-search/types";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  imagePreview?: string;
  choices?: AssistantChoice[];
  products?: AssistantProductCard[];
  actions?: AssistantAction[];
};

export type AssistantLocale = "ar" | "en";

export type AssistantChoice = {
  label: string;
  value: string;
};

export type AssistantIntent =
  | "LIGHTING_RECOMMENDATION"
  | "ROOM_DESIGN"
  | "PRODUCT_DISCOVERY"
  | "PRODUCT_COMPARISON"
  | "CCT_EXPLANATION"
  | "SHOP_BY_SPACE"
  | "SHOP_THE_SCENE"
  | "LIGHTING_DESIGNER"
  | "CART_HELP"
  | "STORE_NAVIGATION"
  | "GENERAL_LIGHTING_ADVICE"
  | "VISUAL_PRODUCT_SEARCH"
  | "WHY_FOLLOWUP"
  | "ALTERNATIVE"
  | "ADJUST_WARMER"
  | "ADJUST_SOFTER"
  | "ADJUST_BRIGHTNESS"
  | "ADJUST_CEILING"
  | "SPACE_PIVOT"
  | "CLARIFICATION"
  | "GREETING"
  | "UNKNOWN";

export type AwaitingField =
  | "space"
  | "dimensions"
  | "ceilingHeight"
  | "wallColor"
  | "mood"
  | "cct"
  | "clarification";

export type ConversationState = {
  currentSpace?: string;
  spaceSlug?: string;
  currentIntent?: AssistantIntent;
  roomLength?: number;
  roomWidth?: number;
  ceilingHeight?: number;
  wallColor?: WallColorTone;
  ceilingColor?: WallColorTone;
  mood?: MoodId;
  preferredCct?: CctChoice;
  interiorStyle?: "light" | "balanced" | "dark";
  naturalLight?: NaturalLightLevel;
  brightnessPreference?: BrightnessPreference;
  lastRecommendation?: string;
  lastRecommendedCategories?: string[];
  lastAssistantAnswer?: string;
  lastDesignerResult?: LightingRecommendationResult;
  lastProductRecommendations?: AssistantProductCard[];
  lastSceneHandoffUrl?: string;
  lastExperienceHandoffUrl?: string;
  alternativeIndex?: number;
  awaitingField?: AwaitingField;
  awaitingClarification?: "product" | "cct" | "layout";
  lastUploadedImagePreview?: string;
  lastVisualSearchResult?: VisualSearchResult;
  lastVisualAttributes?: VisualAttributes;
  lastMatchedProductSlugs?: string[];
  selectedVisualProductIndex?: number;
  visualSearchIntent?: boolean;
  awaitingVisualClarification?: "type" | "color" | "style";
  passportProductSlug?: string;
  passportVariantId?: string;
  passportSku?: string;
  passportProductNameAr?: string;
  passportProductNameEn?: string;
  passportSource?: "passport";
};

export type AssistantProductCard = {
  slug: string;
  nameAr: string;
  nameEn: string;
  imageUrl: string | null;
  sku: string | null;
  keySpec: string | null;
  layer?: LightingLayerKind;
  quantity?: number;
  confidence?: ConfidenceLevel;
  productUrl: string;
  sceneUrl?: string;
  priceText?: string | null;
  priceAvailable: boolean;
};

export type AssistantAction = {
  type: "scene" | "experience" | "category" | "space";
  labelAr: string;
  labelEn: string;
  href: string;
};

export type AssistantRequest = {
  message: string;
  locale: AssistantLocale;
  history?: Array<{ role: ChatRole; content: string }>;
  state?: Partial<ConversationState>;
  visualSearchResult?: VisualSearchResult;
};

export type AssistantResponse = {
  reply: string;
  mode: "demo" | "ai";
  choices?: AssistantChoice[];
  products?: AssistantProductCard[];
  actions?: AssistantAction[];
  state?: Partial<ConversationState>;
};
