import type { ConversationState } from "./assistant-types";

export const ASSISTANT_SESSION_KEY = "osool-assistant-v2";

export type PersistedAssistantSession = {
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: number;
  }>;
  state: Partial<ConversationState>;
  updatedAt: number;
};

export function loadAssistantSession(): PersistedAssistantSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ASSISTANT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAssistantSession;
  } catch {
    return null;
  }
}

export function saveAssistantSession(session: PersistedAssistantSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ASSISTANT_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore quota */
  }
}

export function clearAssistantSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ASSISTANT_SESSION_KEY);
}
