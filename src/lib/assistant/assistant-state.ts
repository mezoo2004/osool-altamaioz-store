import type { SpaceKey } from "./assistant-knowledge";
import type { ConversationState } from "./assistant-types";
import {
  dimensionsFromArea,
  parseArea,
  parseCeilingHeight,
  parseDimensions,
  parseWallColor,
} from "./assistant-parsers";
import { detectCct, detectMood, detectSpace } from "./assistant-state-detectors";

export type { SpaceKey, MoodKey, CctKey } from "./assistant-knowledge";
export {
  detectSpace,
  detectCct,
  detectMood,
  detectFollowUpIntent,
  isRecommendationRequest,
  isAmbiguousSpaceRequest,
  spaceLabel,
} from "./assistant-state-detectors";

export type SessionState = ConversationState & {
  alternativeIndex: number;
};

const SPACE_TO_SLUG: Record<string, string> = {
  majlis: "majlis",
  living: "living-room",
  bedroom: "bedroom",
  kitchen: "kitchen",
  office: "office",
  restaurant: "restaurant",
  retail: "retail-store",
  facade: "facade",
  garden: "garden",
  outdoor: "garden",
};

export function spaceKeyToSlug(key: string): string {
  return SPACE_TO_SLUG[key] ?? key;
}

export function slugToSpaceKey(slug: string): SpaceKey | undefined {
  const entry = Object.entries(SPACE_TO_SLUG).find(([, s]) => s === slug);
  return entry ? (entry[0] as SpaceKey) : undefined;
}

function moodToDesigner(mood?: string): import("@/lib/experience/types").MoodId {
  const map: Record<string, import("@/lib/experience/types").MoodId> = {
    warm: "warm",
    luxury: "luxury",
    modern: "modern",
    bright: "functional",
    practical: "functional",
  };
  return (mood && map[mood]) || "warm";
}

function cctToDesigner(cct?: string): import("@/lib/experience/types").CctChoice {
  if (cct === "4000") return "4000K";
  if (cct === "6500") return "6500K";
  return "3000K";
}

export function applyMessageToState(state: SessionState, message: string): SessionState {
  const next = { ...state };

  const space = detectSpace(message);
  if (space) {
    next.currentSpace = space;
    next.spaceSlug = spaceKeyToSlug(space);
  }

  const dims = parseDimensions(message);
  if (dims) {
    next.roomLength = dims.length;
    next.roomWidth = dims.width;
    next.awaitingField = undefined;
  }

  const area = parseArea(message);
  if (area && !dims) {
    const inferred = dimensionsFromArea(area);
    next.roomLength = inferred.length;
    next.roomWidth = inferred.width;
  }

  const height = parseCeilingHeight(message);
  if (height) {
    next.ceilingHeight = height;
    if (next.awaitingField === "ceilingHeight") next.awaitingField = undefined;
  }

  const wall = parseWallColor(message);
  if (wall) {
    next.wallColor = wall;
    if (next.awaitingField === "wallColor") next.awaitingField = undefined;
  }

  const cct = detectCct(message);
  if (cct) {
    next.preferredCct = cctToDesigner(cct);
  }

  const mood = detectMood(message);
  if (mood) {
    next.mood = moodToDesigner(mood);
    if (next.awaitingField === "mood") next.awaitingField = undefined;
  }

  if (/مو متأكد|not sure|unsure|ما أدري|ما ادري/i.test(message)) {
    next.awaitingField = "mood";
  }

  return next;
}

export function mergeSessionState(
  clientState: Partial<ConversationState> | undefined,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  message: string,
): SessionState {
  const state: SessionState = {
    alternativeIndex: clientState?.alternativeIndex ?? 0,
    ...clientState,
  };

  for (const msg of history) {
    if (msg.role === "user") {
      Object.assign(state, applyMessageToState(state, msg.content));
    }
  }

  Object.assign(state, applyMessageToState(state, message));

  if (state.currentSpace && !state.spaceSlug) {
    state.spaceSlug = spaceKeyToSlug(state.currentSpace);
  }

  return state;
}

export function hasEnoughForDesigner(state: SessionState): boolean {
  return Boolean(
    state.spaceSlug &&
      state.roomLength &&
      state.roomWidth &&
      state.ceilingHeight &&
      state.roomLength > 0 &&
      state.roomWidth > 0 &&
      state.ceilingHeight >= 2,
  );
}

export function nextMissingField(state: SessionState): import("./assistant-types").AwaitingField | null {
  if (!state.currentSpace && !state.spaceSlug) return "space";
  if (!state.roomLength || !state.roomWidth) return "dimensions";
  if (!state.ceilingHeight) return "ceilingHeight";
  if (!state.mood && !state.preferredCct) return "mood";
  return null;
}

export function defaultMoodForSpace(space?: string): import("@/lib/experience/types").MoodId {
  if (space === "kitchen" || space === "office" || space === "retail-store") return "functional";
  if (space === "majlis" || space === "restaurant") return "luxury";
  return "warm";
}

export function defaultWallColor(): import("@/lib/experience/types").WallColorTone {
  return "unsure";
}

export { moodToDesigner, cctToDesigner };
