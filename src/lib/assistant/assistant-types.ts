export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  choices?: AssistantChoice[];
};

export type AssistantLocale = "ar" | "en";

export type AssistantChoice = {
  label: string;
  value: string;
};

export type ConversationState = {
  currentSpace?: string;
  currentIntent?: string;
  currentMood?: string;
  currentCct?: string;
  lastRecommendation?: string;
  lastRecommendedCategories?: string[];
  lastAssistantAnswer?: string;
  alternativeIndex?: number;
};

export type AssistantRequest = {
  message: string;
  locale: AssistantLocale;
  history?: Array<{ role: ChatRole; content: string }>;
};

export type AssistantResponse = {
  reply: string;
  mode: "demo" | "ai";
  choices?: AssistantChoice[];
  state?: Partial<ConversationState>;
};
