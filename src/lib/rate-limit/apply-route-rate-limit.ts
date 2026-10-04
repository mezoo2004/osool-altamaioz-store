import { checkRateLimit, clientRateLimitKey, rateLimitResponse } from "@/lib/rate-limit/memory-rate-limit";

type LimitProfile = {
  scope: string;
  limit: number;
  windowMs: number;
  retryAfterSec?: number;
};

export function applyRouteRateLimit(request: Request, profile: LimitProfile): Response | null {
  const ok = checkRateLimit(
    clientRateLimitKey(request, profile.scope),
    profile.limit,
    profile.windowMs,
  );
  if (ok) return null;
  return rateLimitResponse(profile.retryAfterSec ?? 60);
}

export const RATE_LIMITS = {
  register: { scope: "auth-register", limit: 10, windowMs: 15 * 60 * 1000 },
  login: { scope: "auth-login", limit: 20, windowMs: 15 * 60 * 1000 },
  reviews: { scope: "reviews-submit", limit: 8, windowMs: 60 * 60 * 1000 },
  assistant: { scope: "assistant-chat", limit: 40, windowMs: 15 * 60 * 1000 },
  visualSearch: { scope: "visual-search", limit: 20, windowMs: 15 * 60 * 1000 },
} as const satisfies Record<string, LimitProfile>;
