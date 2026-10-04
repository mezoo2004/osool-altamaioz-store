function finishLabel(finish) {
  const f = String(finish ?? "").toLowerCase();
  if (/wh|white|ابيض/.test(f)) return "white finish";
  if (/bk|black|اسود/.test(f)) return "black finish";
  if (/gy|gray|grey|رمادي/.test(f)) return "gray finish";
  if (/gold|gd|ذهب/.test(f)) return "gold finish";
  if (/chrome|silver|فض/.test(f)) return "chrome finish";
  if (/brush/.test(f)) return "brushed metal finish";
  return finish ? `${finish} finish` : "";
}

export function categoryVisualType(product) {
  const hay = `${product.primaryCategory} ${product.categorySlugs?.join(" ")} ${product.productType} ${product.nameEn} ${product.nameAr}`.toLowerCase();
  if (/switch|socket|مفات|افياش/.test(hay)) return "electrical switch or socket plate";
  if (/fan|مرو/.test(hay)) return "ceiling fan";
  if (/chandelier|pendant|نجف|معلق/.test(hay)) return "chandelier or pendant light fixture";
  if (/strip|rope|حبل|profile|بروفا/.test(hay)) return "LED strip or linear lighting product";
  if (/flood|outdoor|كشاف|facade|garden/.test(hay)) return "outdoor floodlight fixture";
  if (/track|تراك/.test(hay)) return "track light head";
  if (/panel|بانل/.test(hay)) return "LED panel light";
  if (/bulb|لمبة|gu10/.test(hay)) return "LED bulb lamp";
  if (/cob|spot|down|سبوت/.test(hay)) return "recessed downlight or COB spotlight";
  return "premium lighting product";
}

/** Master prompt body — only [PRODUCT DESCRIPTION] varies. */
export function buildMasterPromptDescription(product, variant) {
  const type = categoryVisualType(product);
  const parts = [type];
  const finish = finishLabel(variant.finish);
  if (finish) parts.push(finish);
  if (variant.wattage) parts.push(`${variant.wattage} wattage`);
  if (variant.cct) parts.push(`${variant.cct}K color temperature`);
  if (product.series) parts.push(`${product.series} series`);
  if (variant.size) parts.push(`size ${variant.size}`);
  if (product.installationType) parts.push(`${product.installationType} installation style`);
  const name = (product.nameEn || product.nameAr || "").slice(0, 120);
  if (name) parts.push(`model context: ${name}`);
  if (variant.sku) parts.push(`SKU ${variant.sku}`);
  return parts.join(", ");
}

export function wrapMasterPrompt(productDescription) {
  return (
    `Premium studio ecommerce product photography of ${productDescription}, ` +
    "centered on a clean off-white background, soft studio lighting, subtle realistic contact shadow, " +
    "neutral white balance, high-end catalog photography, front slight three-quarter angle, " +
    "product occupying approximately 70% of frame, photorealistic, no text, no props, no environment, " +
    "no decorative elements, no watermark."
  );
}
