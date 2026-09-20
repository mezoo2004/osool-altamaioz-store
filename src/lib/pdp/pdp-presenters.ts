import type { ProductDetail, ProductSpec, ProductVariant } from "@/lib/catalog/types";
import type { VisualAttributes } from "@/lib/visual-search/types";

export type PdpSpecRow = {
  key: string;
  value: string;
};

const ACCESSORY_KEY =
  /accessories|included|package contents|what'?s included|contents|ملحق|محتويات|العبوة/i;

export function getCategoryLabel(product: ProductDetail, locale: string) {
  if (product.categoryTitle?.trim()) {
    return product.categoryTitle.trim();
  }
  const slug = product.primaryCategory.replace(/-/g, " ");
  return locale === "ar" ? slug : slug.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function collectGalleryImages(product: ProductDetail): (string | null)[] {
  const urls = product.galleryImages?.length
    ? product.galleryImages
    : product.variants.map((v) => v.imageUrl).filter(Boolean);
  const unique = [...new Set(urls as string[])];
  return unique.length ? unique : [null];
}

export function buildKeySpecRows(
  product: ProductDetail,
  variant: ProductVariant | undefined,
  locale: string,
): PdpSpecRow[] {
  const v = variant ?? product.variants[0];
  if (!v) return [];

  const rows: PdpSpecRow[] = [];
  const add = (keyAr: string, keyEn: string, value: string | null | undefined) => {
    const val = value?.trim();
    if (!val) return;
    rows.push({ key: locale === "ar" ? keyAr : keyEn, value: val });
  };

  add("القدرة", "Wattage", v.wattage);
  add("درجة اللون", "CCT", v.cct ? `${v.cct}K` : null);
  add("التشطيب", "Finish", v.finish && v.finish !== "default" ? v.finish : null);
  add("زاوية الإضاءة", "Beam angle", v.beamAngle);
  add("تصنيف IP", "IP rating", v.ipRating);
  add("التركيب", "Installation", product.installationType);

  return rows.slice(0, 5);
}

export function buildSpecificationRows(
  product: ProductDetail,
  variant: ProductVariant | undefined,
  locale: string,
): PdpSpecRow[] {
  const v = variant ?? product.variants[0];
  const rows: PdpSpecRow[] = [];
  const seen = new Set<string>();

  const add = (keyAr: string, keyEn: string, value: string | null | undefined) => {
    const val = value?.trim();
    if (!val) return;
    const key = locale === "ar" ? keyAr : keyEn;
    const dedupe = keyEn.toLowerCase();
    if (seen.has(dedupe)) return;
    seen.add(dedupe);
    rows.push({ key, value: val });
  };

  for (const spec of product.specs) {
    const dedupe = spec.keyEn.toLowerCase();
    if (seen.has(dedupe)) continue;
    if (ACCESSORY_KEY.test(spec.keyEn) || ACCESSORY_KEY.test(spec.keyAr)) continue;
    seen.add(dedupe);
    rows.push({
      key: locale === "ar" ? spec.keyAr : spec.keyEn,
      value: locale === "ar" ? spec.valueAr : spec.valueEn,
    });
  }

  if (v) {
    add("القدرة", "Wattage", v.wattage);
    add("درجة اللون", "CCT", v.cct ? `${v.cct}K` : null);
    add("اللومن", "Lumens", findSpecValue(product.specs, /lumen|لومن/i));
    add("زاوية الإضاءة", "Beam angle", v.beamAngle);
    add("التشطيب", "Finish", v.finish && v.finish !== "default" ? v.finish : null);
    add("اللون", "Color", v.finish && v.finish !== "default" ? v.finish : null);
    add("الحجم", "Size", v.size ?? null);
    add("تصنيف IP", "IP rating", v.ipRating);
    add("الجهد", "Voltage", v.voltage);
    add("الأبعاد", "Dimensions", v.length);
    add("التركيب", "Installation", product.installationType);
    add("الموديل", "Model", v.modelNumber ?? null);
    add("الكود", "SKU", v.sku);
  }

  return rows;
}

function findSpecValue(specs: ProductSpec[], pattern: RegExp) {
  const hit = specs.find((s) => pattern.test(s.keyEn) || pattern.test(s.keyAr));
  if (!hit) return null;
  return hit.valueEn || hit.valueAr;
}

export function extractAccessoryRows(product: ProductDetail, locale: string): PdpSpecRow[] {
  return product.specs
    .filter((s) => ACCESSORY_KEY.test(s.keyEn) || ACCESSORY_KEY.test(s.keyAr))
    .map((s) => ({
      key: locale === "ar" ? s.keyAr : s.keyEn,
      value: locale === "ar" ? s.valueAr : s.valueEn,
    }))
    .filter((r) => r.value.trim().length > 0);
}

export function buildProductDescription(product: ProductDetail, locale: string): string | null {
  const official = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  if (official?.trim()) return official.trim();

  const v = product.variants[0];
  if (!v) return null;

  const parts: string[] = [];
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const category = getCategoryLabel(product, locale);

  if (locale === "ar") {
    parts.push(`${name} — منتج من فئة ${category} ضمن تشكيلة اصول التميز.`);
    if (product.series) parts.push(`السلسلة: ${product.series}.`);
    if (v.wattage) parts.push(`القدرة: ${v.wattage}.`);
    if (v.cct) parts.push(`درجة اللون: ${v.cct}K.`);
    if (product.installationType) parts.push(`نوع التركيب: ${product.installationType}.`);
  } else {
    parts.push(`${name} — a ${category} product from the Osool Altamaioz catalog.`);
    if (product.series) parts.push(`Series: ${product.series}.`);
    if (v.wattage) parts.push(`Power: ${v.wattage}.`);
    if (v.cct) parts.push(`CCT: ${v.cct}K.`);
    if (product.installationType) parts.push(`Installation: ${product.installationType}.`);
  }

  return parts.join(" ");
}

export function buildSuitableUses(product: ProductDetail, locale: string): string[] {
  const uses = new Set<string>();
  const slugs = product.categorySlugs.join(" ").toLowerCase();
  const type = `${product.productType} ${product.primaryCategory} ${product.installationType ?? ""}`.toLowerCase();

  const addAr = (text: string) => uses.add(text);
  const addEn = (text: string) => uses.add(text);

  if (locale === "ar") {
    if (/outdoor|facade|garden|flood|كشاف|خارج/i.test(slugs + type)) {
      addAr("مساحات خارجية وواجهات — عند توفر تصنيف IP مناسب في بيانات المنتج.");
    }
    if (/indoor|panel|down|cob|spot|نجف|داخ/i.test(slugs + type)) {
      addAr("إضاءة داخلية للمنازل والمشاريع.");
    }
    if (/majlis|living|bedroom|kitchen|office|restaurant|retail/i.test(slugs + type)) {
      addAr("صالات المعيشة والمجالس وغرف النوم والمكاتب.");
    }
    if (/switch|socket|مفات|افياش/i.test(slugs + type)) {
      addAr("تركيبات كهربائية للمباني السكنية والتجارية.");
    }
    if (uses.size === 0 && product.installationType) {
      addAr(`تركيب ${product.installationType}.`);
    }
  } else {
    if (/outdoor|facade|garden|flood/i.test(slugs + type)) {
      addEn("Outdoor and facade applications when IP data supports it.");
    }
    if (/indoor|panel|down|cob|spot/i.test(slugs + type)) {
      addEn("Indoor residential and project lighting.");
    }
    if (/majlis|living|bedroom|kitchen|office|restaurant|retail/i.test(slugs + type)) {
      addEn("Living rooms, majlis, bedrooms, and workspaces.");
    }
    if (/switch|socket/i.test(slugs + type)) {
      addEn("Electrical fittings for homes and commercial spaces.");
    }
    if (uses.size === 0 && product.installationType) {
      addEn(`${product.installationType} installation contexts.`);
    }
  }

  return [...uses];
}

export function getWarrantyDisplay(product: ProductDetail, locale: string): string | null {
  const text = locale === "ar" ? product.warrantyTextAr : product.warrantyTextEn;
  if (text?.trim()) return text.trim();

  const hint = product.variants.find((v) => v.warrantyHint?.trim())?.warrantyHint?.trim();
  if (hint) return hint;

  return null;
}

export function buildVisualAttributesFromProduct(
  product: ProductDetail,
  variant?: ProductVariant,
): VisualAttributes {
  const keywords = [
    product.nameEn,
    product.nameAr,
    product.series ?? "",
    product.primaryCategory,
    variant?.finish ?? "",
  ].filter(Boolean);

  let productType: VisualAttributes["productType"] = "unknown";
  const hay = `${product.productType} ${product.primaryCategory} ${product.categorySlugs.join(" ")}`.toLowerCase();
  if (/chandelier|نجف|pendant/i.test(hay)) productType = "chandelier";
  else if (/cob|spot|down/i.test(hay)) productType = "spotlight";
  else if (/panel/i.test(hay)) productType = "panel";
  else if (/strip|profile/i.test(hay)) productType = "strip";
  else if (/flood|facade|outdoor/i.test(hay)) productType = "floodlight";
  else if (/track/i.test(hay)) productType = "track";
  else if (/switch|socket/i.test(hay)) productType = "switch";

  return {
    productType,
    finish: variant?.finish ?? undefined,
    keywords: keywords.slice(0, 8),
  };
}

export function supportsShopTheScene(product: ProductDetail): boolean {
  const hay = `${product.productType} ${product.primaryCategory} ${product.categorySlugs.join(" ")}`.toLowerCase();
  if (/switch|socket|مفات|افياش|bulb|لمبة/i.test(hay)) return false;
  return true;
}
