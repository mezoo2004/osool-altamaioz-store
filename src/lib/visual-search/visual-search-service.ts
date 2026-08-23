import { matchCatalogProducts, mergeAttributesFromQuery } from "./catalog-visual-matcher";
import { inferAttributesFromFallback } from "./fallback-visual-search";
import { validateImageBuffer } from "./image-validation";
import type { VisualSearchRequest, VisualSearchResult, VisualAttributes } from "./types";
import { analyzeImageWithVision } from "./vision-provider";

export class VisualSearchService {
  async search(request: VisualSearchRequest): Promise<VisualSearchResult> {
    const locale = request.locale;
    let attributes: VisualAttributes = {
      ...(request.attributes ?? {}),
      keywords: [...(request.attributes?.keywords ?? [])],
    };
    let mode: VisualSearchResult["mode"] = "fallback";
    let confidence: VisualSearchResult["confidence"] = "low";

    if (request.query) {
      attributes = mergeAttributesFromQuery(attributes, request.query);
    }

    if (request.imageBuffer && request.imageMime) {
      const validation = validateImageBuffer(request.imageBuffer, request.imageMime);
      if (!validation.valid) {
        return {
          mode: "fallback",
          attributes,
          products: [],
          needsClarification: true,
          clarificationField: "type",
          confidence: "low",
        };
      }

      const vision = await analyzeImageWithVision({
        imageBuffer: request.imageBuffer,
        mime: validation.mime,
        locale,
        query: request.query,
      });

      if (vision) {
        mode = "vision";
        confidence = vision.confidence;
        attributes = { ...attributes, ...vision.attributes };
      }
    }

    const fallback = inferAttributesFromFallback({ query: request.query, partial: attributes });
    attributes = fallback.attributes;

    if (fallback.needsClarification && mode === "fallback" && !request.attributes?.productType) {
      return {
        mode: "fallback",
        attributes,
        products: [],
        needsClarification: true,
        clarificationField: fallback.clarificationField,
        confidence: "low",
      };
    }

    const products = await matchCatalogProducts({ attributes, locale, limit: 6 });

    if (products.length === 0) {
      return {
        mode,
        attributes,
        products: [],
        needsClarification: true,
        clarificationField: "type",
        confidence: "low",
      };
    }

    return {
      mode,
      attributes,
      products,
      needsClarification: false,
      confidence: products[0].score > 50 ? "high" : confidence,
    };
  }
}

export const visualSearchService = new VisualSearchService();

export async function runVisualSearch(request: VisualSearchRequest): Promise<VisualSearchResult> {
  return visualSearchService.search(request);
}
