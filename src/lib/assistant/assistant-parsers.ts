import type { WallColorTone } from "@/lib/experience/types";

export type ParsedDimensions = {
  length: number;
  width: number;
};

/** Parse room dimensions from natural Arabic/English text e.g. 6×8, 6 x 8, 6*8 */
export function parseDimensions(text: string): ParsedDimensions | null {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*[×xX*]\s*(\d+(?:\.\d+)?)/,
    /(\d+(?:\.\d+)?)\s*(?:م|m)?\s*(?:في|by|×|x)\s*(\d+(?:\.\d+)?)/i,
    /طول\s*(\d+(?:\.\d+)?).*?(?:عرض|width)\s*(\d+(?:\.\d+)?)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const length = parseFloat(m[1]);
      const width = parseFloat(m[2]);
      if (length > 0 && width > 0 && length <= 100 && width <= 100) {
        return { length, width };
      }
    }
  }
  return null;
}

/** Parse ceiling height e.g. السقف 3.5, ارتفاع 3م, ceiling 3m */
export function parseCeilingHeight(text: string): number | null {
  const patterns = [
    /(?:السقف|سقف|ارتفاع|ceiling)\s*(?:حوالي|تقريب[اً]?|about)?\s*(\d+(?:\.\d+)?)\s*(?:م|m)?/i,
    /(\d+(?:\.\d+)?)\s*(?:م|m)\s*(?:سقف|ارتفاع|ceiling)/i,
    /(?:ارتفاع|Sceiling height)\s*(\d+(?:\.\d+)?)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const h = parseFloat(m[1]);
      if (h >= 2 && h <= 12) return h;
    }
  }
  // Standalone number when awaiting ceiling
  if (/^\d+(?:\.\d+)?$/.test(text.trim())) {
    const h = parseFloat(text.trim());
    if (h >= 2 && h <= 12) return h;
  }
  return null;
}

export function parseArea(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(?:م²|م2|m²|m2|متر\s*(?:مربع|square))/i);
  if (m) {
    const area = parseFloat(m[1]);
    if (area > 0 && area <= 800) return area;
  }
  return null;
}

/** Infer square room from area mention */
export function dimensionsFromArea(area: number): ParsedDimensions {
  const side = Math.sqrt(area);
  return { length: Math.round(side * 10) / 10, width: Math.round(side * 10) / 10 };
}

export function parseWallColor(text: string): WallColorTone | undefined {
  const n = text.toLowerCase();
  if (/أبيض|ابيض|very light|white|فاتح جدا|فاتحه جدا/.test(n)) return "very_light";
  if (/بيج|beige|أوف\s*وايت|off white|off-white|فاتح/.test(n) && !/رمادي|gray/.test(n)) return "beige";
  if (/رمادي\s*فات|light gray|light grey|رمادي فاتح/.test(n)) return "light_gray";
  if (/داكن|غامق|dark|رمادي\s*غام|رمادي غام/.test(n)) return "dark_gray";
  if (/دافئ|warm tone|ألوان داف/.test(n)) return "warm_tones";
  if (/متوسط|medium|رمادي(?! فات| غام)/.test(n)) return "light_gray";
  return undefined;
}

export function isCeilingChangeRequest(text: string): boolean {
  return /(?:لو|إذا|if)\s*(?:ال)?(?:سقف|ارتفاع)|(?:السقف|سقف)\s*\d|ceiling\s*\d/i.test(text);
}

export function isAmbiguousReference(text: string): boolean {
  const n = text.trim().toLowerCase();
  return (
    /^(هذا|هذي|هاذا|هذاك|ذلك|it|this|that)\??$/.test(n) ||
    /وش تقصد|ما تقصد|which one|what do you mean/i.test(n)
  );
}
