"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/commerce/cart-provider";
import { useCartFeedback } from "@/components/commerce/cart-feedback-provider";
import { ScenePreviewStage } from "@/components/experience/scene-preview-stage";
import { ExperienceBreadcrumb } from "@/components/experience/experience-breadcrumb";
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder";
import { getPriceDisplay, getProductName } from "@/lib/catalog/display";
import type { ProductDetail } from "@/lib/catalog/types";
import { trackEvent } from "@/lib/analytics";
import { variantIssueCodes } from "@/lib/experience/client-utils";
import { toCartLines } from "@/lib/experience/cart-lines";
import { normalizeCct } from "@/lib/experience/scene-preview";
import type {
  CctChoice,
  ResolvedSceneItem,
  SceneHotspotRecord,
  SceneRecord,
  SpaceRecord,
} from "@/lib/experience/types";
import { cn } from "@/lib/utils";

type HotspotProduct = {
  hotspot: SceneHotspotRecord;
  product: ProductDetail;
  variant: ProductDetail["variants"][number];
};

type SceneDetailContentProps = {
  scene: SceneRecord;
  space: SpaceRecord | null;
  hotspotProducts: HotspotProduct[];
  locale: string;
};

export function SceneDetailContent({
  scene,
  space,
  hotspotProducts,
  locale,
}: SceneDetailContentProps) {
  const t = useTranslations("experiences");
  const tCommon = useTranslations("common");
  const tCatalog = useTranslations("catalog");
  const searchParams = useSearchParams();
  const { addLine, mergeLines } = useCart();
  const { showAddedFeedback } = useCartFeedback();
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";

  const spaceSlug = space?.slug ?? "majlis";

  const initialHotspot =
    searchParams.get("hotspot") ??
    hotspotProducts.find((h) => h.product.slug === searchParams.get("product"))?.hotspot.id ??
    hotspotProducts[0]?.hotspot.id ??
    null;

  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(initialHotspot);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(
    searchParams.get("product") ?? hotspotProducts[0]?.product.slug ?? null,
  );
  const [previewCctOverride, setPreviewCctOverride] = useState<CctChoice | null>(
    searchParams.get("cct") ? normalizeCct(searchParams.get("cct")) : null,
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [bundleModal, setBundleModal] = useState<{
    available: ResolvedSceneItem[];
    unavailable: ResolvedSceneItem[];
  } | null>(null);
  const [adding, setAdding] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  useEffect(() => {
    trackEvent("shop_scene_view", { scene_slug: scene.slug });
    const initial: Record<string, number> = {};
    for (const item of scene.items) {
      initial[item.productSlug] = item.quantity;
    }
    setQuantities(initial);
  }, [scene]);

  const productBySlug = useMemo(() => {
    const map = new Map<string, HotspotProduct>();
    for (const hp of hotspotProducts) {
      map.set(hp.product.slug, hp);
    }
    return map;
  }, [hotspotProducts]);

  const activeHotspotProduct = useMemo(
    () => hotspotProducts.find((h) => h.hotspot.id === activeHotspotId) ?? hotspotProducts[0],
    [activeHotspotId, hotspotProducts],
  );

  const panelProduct = useMemo(() => {
    if (selectedProductSlug && productBySlug.has(selectedProductSlug)) {
      return productBySlug.get(selectedProductSlug)!;
    }
    return activeHotspotProduct;
  }, [selectedProductSlug, productBySlug, activeHotspotProduct]);

  const previewCct: CctChoice =
    previewCctOverride ?? normalizeCct(panelProduct?.variant.cct ?? searchParams.get("cct"));

  const previewHotspots = useMemo(
    () =>
      hotspotProducts.map(({ hotspot, product, variant }) => {
        const isActiveHotspot = hotspot.id === activeHotspotId;
        const usePanelProduct = isActiveHotspot && panelProduct;
        return {
          id: hotspot.id,
          x: hotspot.x,
          y: hotspot.y,
          label: locale === "ar" ? hotspot.labelAr : hotspot.labelEn,
          cct: usePanelProduct ? panelProduct.variant.cct : variant.cct,
          wattage: usePanelProduct ? panelProduct.variant.wattage : variant.wattage,
          categorySlug: product.primaryCategory,
        };
      }),
    [hotspotProducts, activeHotspotId, panelProduct, locale],
  );

  const selectHotspot = useCallback(
    (id: string) => {
      setActiveHotspotId(id);
      const hp = hotspotProducts.find((h) => h.hotspot.id === id);
      if (hp) setSelectedProductSlug(hp.product.slug);
      setMobilePanelOpen(true);
      trackEvent("scene_hotspot_select", { scene_slug: scene.slug, hotspot_id: id });
    },
    [hotspotProducts, scene.slug],
  );

  const selectProduct = useCallback((slug: string) => {
    setSelectedProductSlug(slug);
    setPreviewCctOverride(null);
    setMobilePanelOpen(true);
  }, []);

  const handleAddItem = () => {
    if (!panelProduct) return;
    const qty = quantities[panelProduct.product.slug] ?? 1;
    addLine({
      productId: panelProduct.product.id,
      productSlug: panelProduct.product.slug,
      variantId: panelProduct.variant.id,
      variantSku: panelProduct.variant.sku,
      quantity: qty,
    });
    showAddedFeedback({
      productName: getProductName(panelProduct.product, locale),
      productSlug: panelProduct.product.slug,
      quantity: qty,
    });
    trackEvent("shop_scene_add_item", { scene_slug: scene.slug, product_slug: panelProduct.product.slug });
  };

  const handleAddBundle = async () => {
    setAdding(true);
    const items = scene.items.map((item) => ({
      ...item,
      quantity: quantities[item.productSlug] ?? item.quantity,
    }));

    try {
      const res = await fetch("/api/experience/validate-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const validation = (await res.json()) as {
        available: ResolvedSceneItem[];
        unavailable: ResolvedSceneItem[];
        allAvailable: boolean;
      };
      setAdding(false);

      if (validation.allAvailable) {
        mergeLines(toCartLines(validation.available));
        trackEvent("shop_scene_add_bundle", { scene_slug: scene.slug, mode: "full" });
        return;
      }

      setBundleModal({
        available: validation.available,
        unavailable: validation.unavailable,
      });
    } catch {
      setAdding(false);
    }
  };

  const confirmPartialBundle = () => {
    if (!bundleModal) return;
    mergeLines(toCartLines(bundleModal.available));
    trackEvent("shop_scene_add_bundle", { scene_slug: scene.slug, mode: "partial" });
    setBundleModal(null);
  };

  const activePrice = panelProduct ? getPriceDisplay(panelProduct.product, panelProduct.variant, locale) : null;
  const activeName = panelProduct ? getProductName(panelProduct.product, locale) : "";
  const activeIssues = panelProduct ? variantIssueCodes(panelProduct.product, panelProduct.variant) : [];

  return (
    <div className="scene-detail-page pb-mobile-scene-extra md:pb-16">
      <section className="border-b border-border bg-[#080808] text-white">
        <div className="container-page py-6 md:py-8 [&_nav_a]:text-white/70 [&_nav_a:hover]:text-white [&_nav_ol]:text-white/50">
          <ExperienceBreadcrumb
            items={[
              { label: brand, href: "/" },
              { label: t("scenesTitle"), href: "/scenes" },
              { label: locale === "ar" ? scene.nameAr : scene.nameEn },
            ]}
          />
          <div className="mt-4 max-w-2xl">
            {space && (
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-orange">
                {locale === "ar" ? space.nameAr : space.nameEn}
              </p>
            )}
            <h1 className="heading-subsection text-white">{locale === "ar" ? scene.nameAr : scene.nameEn}</h1>
            <p className="mt-2 text-sm text-white/62">{locale === "ar" ? scene.descriptionAr : scene.descriptionEn}</p>
          </div>
        </div>
      </section>

      <div className="container-page py-8 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,320px)_1fr] lg:gap-8">
          <aside className="order-2 lg:order-1">
            <div className="lg:sticky lg:top-24">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary">
                {t("sceneProductPanel")}
              </p>
              <ul className="space-y-2">
                {hotspotProducts.map(({ hotspot, product, variant }) => {
                  const selected = selectedProductSlug === product.slug;
                  const price = getPriceDisplay(product, variant, locale);
                  return (
                    <li key={hotspot.id}>
                      <button
                        type="button"
                        onClick={() => selectProduct(product.slug)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border p-3 text-start transition-all duration-200 motion-reduce:transition-none",
                          selected
                            ? "border-brand-orange/50 bg-brand-orange/5 ring-1 ring-brand-orange/30"
                            : "border-border bg-white hover:border-brand-black-soft/20",
                        )}
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-surface-muted">
                          <ProductImagePlaceholder locale={locale} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-text-secondary">
                            {locale === "ar" ? hotspot.labelAr : hotspot.labelEn}
                          </p>
                          <p className="truncate text-sm font-medium">{getProductName(product, locale)}</p>
                          <p className="text-xs text-text-secondary">{price.text}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {panelProduct && (
                <div className="mt-5 hidden rounded-xl border border-border bg-white p-4 lg:block">
                  <ProductDetailPanel
                    panelProduct={panelProduct}
                    locale={locale}
                    quantities={quantities}
                    setQuantities={setQuantities}
                    previewCct={previewCct}
                    setPreviewCctOverride={setPreviewCctOverride}
                    t={t}
                    tCommon={tCommon}
                    tCatalog={tCatalog}
                    activePrice={activePrice}
                    activeName={activeName}
                    activeIssues={activeIssues}
                    handleAddItem={handleAddItem}
                  />
                </div>
              )}

              <div className="mt-4 hidden rounded-lg border border-border bg-surface-muted p-4 text-sm lg:block">
                <p className="font-medium">{t("sceneBundleHint")}</p>
                <p className="mt-1 text-meta">{scene.items.length} {t("productsInScene")}</p>
                <button type="button" onClick={handleAddBundle} disabled={adding} className="btn-cta mt-4 w-full">
                  {t("addFullScene")}
                </button>
              </div>
            </div>
          </aside>

          <div className="order-1 lg:order-2">
            {activeHotspotId && (
              <ScenePreviewStage
                spaceSlug={spaceSlug}
                hotspots={previewHotspots}
                activeHotspotId={activeHotspotId}
                previewCct={previewCct}
                onHotspotClick={selectHotspot}
              />
            )}
            <p className="mt-3 text-sm text-text-secondary">{t("scenePreviewHint")}</p>

            <div className="mt-5 flex flex-wrap gap-3 lg:hidden">
              <button type="button" onClick={handleAddBundle} disabled={adding} className="btn-cta">
                {t("addFullScene")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {panelProduct && (
        <div className="bottom-mobile-nav fixed inset-x-0 z-30 lg:hidden">
          <div className="border-t border-border bg-white/95 shadow-[0_-4px_24px_rgba(8,8,8,0.06)] backdrop-blur">
            <button
              type="button"
              onClick={() => setMobilePanelOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
            >
              <span>{activeName}</span>
              <span className="text-text-secondary">{mobilePanelOpen ? "−" : "+"}</span>
            </button>
            {mobilePanelOpen && (
              <div className="max-h-[min(55vh,24rem)] overflow-y-auto border-t border-border px-4 pb-4">
                <ProductDetailPanel
                  panelProduct={panelProduct}
                  locale={locale}
                  quantities={quantities}
                  setQuantities={setQuantities}
                  previewCct={previewCct}
                  setPreviewCctOverride={setPreviewCctOverride}
                  t={t}
                  tCommon={tCommon}
                  tCatalog={tCatalog}
                  activePrice={activePrice}
                  activeName={activeName}
                  activeIssues={activeIssues}
                  handleAddItem={handleAddItem}
                  compact
                />
              </div>
            )}
          </div>
        </div>
      )}

      {bundleModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bundle-dialog-title"
            className="w-full max-h-[min(90vh,32rem)] max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-soft md:p-6"
          >
            <h2 id="bundle-dialog-title" className="heading-subsection">{t("partialAvailabilityTitle")}</h2>
            <p className="mt-2 text-meta">{t("partialAvailabilityBody")}</p>

            {bundleModal.available.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium">{t("availableItems")}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {bundleModal.available.map((item) => (
                    <li key={item.variantSku}>
                      {locale === "ar" ? item.nameAr : item.nameEn} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {bundleModal.unavailable.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-brand-orange">{t("unavailableItems")}</p>
                <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                  {bundleModal.unavailable.map((item) => (
                    <li key={item.variantSku}>
                      {locale === "ar" ? item.nameAr : item.nameEn} — {item.issues.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {bundleModal.available.length > 0 && (
                <button type="button" onClick={confirmPartialBundle} className="btn-cta h-10 px-4">
                  {t("addAvailableOnly")}
                </button>
              )}
              <button type="button" onClick={() => setBundleModal(null)} className="btn-cta-secondary h-10 px-4">
                {tCommon("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductDetailPanel({
  panelProduct,
  locale,
  quantities,
  setQuantities,
  previewCct,
  setPreviewCctOverride,
  t,
  tCommon,
  tCatalog,
  activePrice,
  activeName,
  activeIssues,
  handleAddItem,
  compact = false,
}: {
  panelProduct: HotspotProduct;
  locale: string;
  quantities: Record<string, number>;
  setQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  previewCct: CctChoice;
  setPreviewCctOverride: (cct: CctChoice) => void;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
  tCatalog: ReturnType<typeof useTranslations>;
  activePrice: ReturnType<typeof getPriceDisplay> | null;
  activeName: string;
  activeIssues: string[];
  handleAddItem: () => void;
  compact?: boolean;
}) {
  const qty = quantities[panelProduct.product.slug] ?? 1;
  const outOfStock = panelProduct.variant.stockStatus === "OUT_OF_STOCK";
  const cctOptions: CctChoice[] = ["3000K", "4000K", "6500K"];

  return (
    <div className={cn(compact ? "pt-3" : "")}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-text-secondary">
        {locale === "ar" ? panelProduct.hotspot.labelAr : panelProduct.hotspot.labelEn}
      </p>
      <h3 className="mt-2 font-medium leading-snug">{activeName}</h3>
      <p className="mt-1 text-price">{activePrice?.text}</p>
      {panelProduct.variant.wattage && (
        <p className="mt-0.5 text-meta">{panelProduct.variant.wattage}</p>
      )}
      {outOfStock && <p className="mt-1 text-xs text-brand-orange">{tCatalog("outOfStock")}</p>}

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-text-secondary">{t("previewCct")}</p>
        <div className="flex flex-wrap gap-2">
          {cctOptions.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setPreviewCctOverride(k)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs transition-colors",
                previewCct === k ? "border-brand-orange bg-brand-orange/10 text-brand-orange" : "border-border",
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm" htmlFor={`qty-${panelProduct.product.slug}`}>{t("quantity")}</label>
        <input
          id={`qty-${panelProduct.product.slug}`}
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) =>
            setQuantities((prev) => ({
              ...prev,
              [panelProduct.product.slug]: Math.max(1, Number(e.target.value) || 1),
            }))
          }
          className="input-field h-10 w-20"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/products/${panelProduct.product.slug}?sku=${encodeURIComponent(panelProduct.variant.sku)}`}
          className="btn-cta-secondary h-10 px-4 text-sm"
        >
          {t("viewProduct")}
        </Link>
        <button type="button" onClick={handleAddItem} disabled={outOfStock} className="btn-cta h-10 px-4 text-sm">
          {tCommon("addToCart")}
        </button>
      </div>
      {activeIssues.includes("price_unavailable") && (
        <p className="mt-2 text-meta">{tCatalog("priceUnavailable")}</p>
      )}
    </div>
  );
}
