"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/commerce/cart-provider";
import { useCartFeedback } from "@/components/commerce/cart-feedback-provider";
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder";
import { ExperienceBreadcrumb } from "@/components/experience/experience-breadcrumb";
import { getPriceDisplay, getProductName } from "@/lib/catalog/display";
import type { ProductDetail } from "@/lib/catalog/types";
import { trackEvent } from "@/lib/analytics";
import { variantIssueCodes } from "@/lib/experience/client-utils";
import { toCartLines } from "@/lib/experience/cart-lines";
import type {
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
  const { addLine, mergeLines } = useCart();
  const { showAddedFeedback } = useCartFeedback();
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";

  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(
    hotspotProducts[0]?.hotspot.id ?? null,
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [bundleModal, setBundleModal] = useState<{
    available: ResolvedSceneItem[];
    unavailable: ResolvedSceneItem[];
  } | null>(null);
  const [adding, setAdding] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(true);

  useEffect(() => {
    trackEvent("shop_scene_view", { scene_slug: scene.slug });
    const initial: Record<string, number> = {};
    for (const item of scene.items) {
      initial[item.productSlug] = item.quantity;
    }
    setQuantities(initial);
  }, [scene]);

  const active = useMemo(
    () => hotspotProducts.find((h) => h.hotspot.id === activeHotspotId) ?? hotspotProducts[0],
    [activeHotspotId, hotspotProducts],
  );

  const selectHotspot = useCallback(
    (id: string) => {
      setActiveHotspotId(id);
      setMobilePanelOpen(true);
      trackEvent("scene_hotspot_select", { scene_slug: scene.slug, hotspot_id: id });
    },
    [scene.slug],
  );

  const handleAddItem = () => {
    if (!active) return;
    const qty = quantities[active.product.slug] ?? 1;
    addLine({
      productId: active.product.id,
      productSlug: active.product.slug,
      variantId: active.variant.id,
      variantSku: active.variant.sku,
      quantity: qty,
    });
    showAddedFeedback({
      productName: getProductName(active.product, locale),
      productSlug: active.product.slug,
      quantity: qty,
    });
    trackEvent("shop_scene_add_item", { scene_slug: scene.slug, product_slug: active.product.slug });
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

  const activePrice = active ? getPriceDisplay(active.product, active.variant, locale) : null;
  const activeName = active ? getProductName(active.product, locale) : "";
  const activeIssues = active ? variantIssueCodes(active.product, active.variant) : [];

  return (
    <div className="pb-mobile-scene-extra md:pb-16">
      <div className="container-page py-8 md:py-10">
        <ExperienceBreadcrumb
          items={[
            { label: brand, href: "/" },
            { label: t("scenesTitle"), href: "/scenes" },
            { label: locale === "ar" ? scene.nameAr : scene.nameEn },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <div className="relative overflow-hidden rounded-xl border border-border bg-brand-black-soft">
              <div className="relative aspect-[4/3] w-full md:aspect-[16/10]">
                <div
                  className="absolute inset-0 opacity-25"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                {hotspotProducts.map(({ hotspot }) => (
                  <button
                    key={hotspot.id}
                    type="button"
                    aria-label={locale === "ar" ? hotspot.labelAr : hotspot.labelEn}
                    aria-pressed={activeHotspotId === hotspot.id}
                    onClick={() => selectHotspot(hotspot.id)}
                    className={cn(
                      "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all motion-reduce:transition-none",
                      "h-11 w-11 md:h-8 md:w-8",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange",
                    )}
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                  >
                    <span
                      className={cn(
                        "rounded-full border-2 transition-all motion-reduce:transition-none",
                        activeHotspotId === hotspot.id
                          ? "h-3 w-3 border-white bg-brand-orange shadow-[0_0_0_4px_rgba(234,90,45,0.25)] md:h-2.5 md:w-2.5"
                          : "h-2.5 w-2.5 border-white/90 bg-white/30 hover:bg-white/60 md:h-2 md:w-2",
                      )}
                    />
                    <span className="sr-only">{locale === "ar" ? hotspot.labelAr : hotspot.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={handleAddBundle} disabled={adding} className="btn-cta">
                {t("addFullScene")}
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <SceneHeader scene={scene} space={space} locale={locale} />
              {active && (
                <HotspotPanel
                  active={active}
                  locale={locale}
                  quantities={quantities}
                  setQuantities={setQuantities}
                  t={t}
                  tCommon={tCommon}
                  tCatalog={tCatalog}
                  activePrice={activePrice}
                  activeName={activeName}
                  activeIssues={activeIssues}
                  handleAddItem={handleAddItem}
                />
              )}
              <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm">
                <p className="font-medium">{t("sceneBundleHint")}</p>
                <p className="mt-1 text-meta">{scene.items.length} {t("productsInScene")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {active && (
        <div className="bottom-mobile-nav fixed inset-x-0 z-30 lg:hidden">
          <div className="border-t border-border bg-white/95 shadow-[0_-4px_24px_rgba(8,8,8,0.06)] backdrop-blur">
            <button
              type="button"
              onClick={() => setMobilePanelOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
            >
              <span>{locale === "ar" ? active.hotspot.labelAr : active.hotspot.labelEn}</span>
              <span className="text-text-secondary">{mobilePanelOpen ? "−" : "+"}</span>
            </button>
            {mobilePanelOpen && (
              <div className="max-h-[min(55vh,22rem)] overflow-y-auto border-t border-border px-4 pb-4">
                <HotspotPanel
                  active={active}
                  locale={locale}
                  quantities={quantities}
                  setQuantities={setQuantities}
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

function SceneHeader({
  scene,
  space,
  locale,
}: {
  scene: SceneRecord;
  space: SpaceRecord | null;
  locale: string;
}) {
  return (
    <div>
      {space && (
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-brand-orange">
          {locale === "ar" ? space.nameAr : space.nameEn}
        </p>
      )}
      <h1 className="heading-subsection mt-1">{locale === "ar" ? scene.nameAr : scene.nameEn}</h1>
      <p className="mt-2 text-meta">{locale === "ar" ? scene.descriptionAr : scene.descriptionEn}</p>
    </div>
  );
}

function HotspotPanel({
  active,
  locale,
  quantities,
  setQuantities,
  t,
  tCommon,
  tCatalog,
  activePrice,
  activeName,
  activeIssues,
  handleAddItem,
  compact = false,
}: {
  active: HotspotProduct;
  locale: string;
  quantities: Record<string, number>;
  setQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
  tCatalog: ReturnType<typeof useTranslations>;
  activePrice: ReturnType<typeof getPriceDisplay> | null;
  activeName: string;
  activeIssues: string[];
  handleAddItem: () => void;
  compact?: boolean;
}) {
  const qty = quantities[active.product.slug] ?? 1;
  const outOfStock = active.variant.stockStatus === "OUT_OF_STOCK";

  return (
    <div className={cn("card-surface", compact ? "border-0 p-0 shadow-none" : "p-5")}>
      {!compact && (
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-text-secondary">
          {locale === "ar" ? active.hotspot.labelAr : active.hotspot.labelEn}
        </p>
      )}
      <div className="mt-3 flex gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
          <ProductImagePlaceholder locale={locale} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium leading-snug">{activeName}</h3>
          <p className="mt-1 text-price">{activePrice?.text}</p>
          {active.variant.cct && <p className="mt-0.5 text-meta">{active.variant.cct}</p>}
          {outOfStock && <p className="mt-1 text-xs text-brand-orange">{tCatalog("outOfStock")}</p>}
          {activeIssues.includes("price_unavailable") && (
            <p className="mt-1 text-meta">{tCatalog("priceUnavailable")}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm" htmlFor={`qty-${active.product.slug}`}>{t("quantity")}</label>
        <input
          id={`qty-${active.product.slug}`}
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) =>
            setQuantities((prev) => ({
              ...prev,
              [active.product.slug]: Math.max(1, Number(e.target.value) || 1),
            }))
          }
          className="input-field h-10 w-20"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/products/${active.product.slug}?sku=${encodeURIComponent(active.variant.sku)}`}
          className="btn-cta-secondary h-10 px-4 text-sm"
        >
          {t("viewProduct")}
        </Link>
        <button type="button" onClick={handleAddItem} disabled={outOfStock} className="btn-cta h-10 px-4 text-sm">
          {tCommon("addToCart")}
        </button>
      </div>
    </div>
  );
}
