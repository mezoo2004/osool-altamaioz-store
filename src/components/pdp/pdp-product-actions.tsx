"use client";

import { Link } from "@/i18n/navigation";
import { Sparkles, ScanSearch, Layers3 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductDetail, ProductVariant } from "@/lib/catalog/types";
import { openAssistantWithProduct } from "@/lib/pdp/pdp-assistant-bridge";
import { openSimilarProductsSearch } from "@/lib/pdp/pdp-visual-search-bridge";
import { buildPdpSceneHref } from "@/lib/pdp/pdp-scene-handoff";
import { supportsShopTheScene } from "@/lib/pdp/pdp-presenters";

type PdpProductActionsProps = {
  product: ProductDetail;
  variant: ProductVariant | undefined;
  locale: "ar" | "en";
};

export function PdpProductActions({ product, variant, locale }: PdpProductActionsProps) {
  const t = useTranslations("pdp");
  const showScene = supportsShopTheScene(product);
  const sceneHref = showScene ? buildPdpSceneHref(product, variant) : null;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => openAssistantWithProduct(product, variant, locale)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-medium transition-colors hover:border-brand-orange/40 hover:bg-brand-orange/5"
      >
        <Sparkles className="h-4 w-4 text-brand-orange" strokeWidth={1.5} />
        {t("askAssistant")}
      </button>
      <button
        type="button"
        onClick={() => openSimilarProductsSearch(product, variant, locale)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-medium transition-colors hover:border-brand-orange/40 hover:bg-brand-orange/5"
      >
        <ScanSearch className="h-4 w-4 text-brand-orange" strokeWidth={1.5} />
        {t("similarVisualSearch")}
      </button>
      {sceneHref && (
        <Link
          href={sceneHref}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-medium transition-colors hover:border-brand-orange/40 hover:bg-brand-orange/5 sm:col-span-2"
        >
          <Layers3 className="h-4 w-4 text-brand-orange" strokeWidth={1.5} />
          {t("tryInScene")}
        </Link>
      )}
    </div>
  );
}
