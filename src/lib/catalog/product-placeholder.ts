export type PlaceholderSilhouette =
  | "spotlight"
  | "pendant"
  | "linear"
  | "outdoor"
  | "switch"
  | "fan"
  | "default";

/** Maps product categories to a neutral placeholder silhouette — not product-specific. */
export function getProductPlaceholderSilhouette(
  categorySlugs: string[],
  productType?: string | null,
): PlaceholderSilhouette {
  const haystack = `${categorySlugs.join(" ")} ${productType ?? ""}`.toLowerCase();

  if (/(outdoor|flood|facade|garden)/.test(haystack)) return "outdoor";
  if (/(fan|ceiling-fan)/.test(haystack)) return "fan";
  if (/(switch|socket|control|smart)/.test(haystack)) return "switch";
  if (/(strip|profile|linear|track)/.test(haystack)) return "linear";
  if (/(chandelier|pendant|decorative)/.test(haystack)) return "pendant";
  if (/(spot|cob|downlight|panel|bulb|indoor)/.test(haystack)) return "spotlight";

  return "default";
}
