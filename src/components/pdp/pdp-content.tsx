"use client";

import { Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/commerce/cart-provider";
import { useCartFeedback } from "@/components/commerce/cart-feedback-provider";
import { useWishlist } from "@/components/commerce/wishlist-provider";
import { ProductGrid } from "@/components/catalog/product-card";
import { PdpGallery } from "@/components/pdp/pdp-gallery";
import {
  BulletList,
  PdpDetailSections,
  SpecTable,
} from "@/components/pdp/pdp-detail-sections";
import { PdpProductActions } from "@/components/pdp/pdp-product-actions";
import {
  findVariantBySelections,
  getAvailableOptions,
  getPriceDisplay,
  getProductName,
  isCombinationAvailable,
} from "@/lib/catalog/display";
import {
  buildKeySpecRows,
  buildProductDescription,
  buildSpecificationRows,
  buildSuitableUses,
  collectGalleryImages,
  extractAccessoryRows,
  getCategoryLabel,
  getWarrantyDisplay,
} from "@/lib/pdp/pdp-presenters";
import { RecentlyViewedSection } from "@/components/pdp/recently-viewed";
import type { Product, ProductDetail } from "@/lib/catalog/types";
import { designTokens } from "@/lib/design-tokens";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type PdpContentProps = {
  product: ProductDetail;
  related: Product[];
  completeTheLook: Product[];
  locale: string;
  initialSku?: string;
};

export function PdpContent({
  product,
  related,
  completeTheLook,
  locale,
  initialSku,
}: PdpContentProps) {
  const t = useTranslations("pdp");
  const tCatalog = useTranslations("catalog");
  const localeKey = locale as "ar" | "en";
  const { addLine } = useCart();
  const { showAddedFeedback } = useCartFeedback();
  const { has, toggle } = useWishlist();

  useEffect(() => {
    trackEvent("view_item", {
      product_slug: product.slug,
      product_id: product.id,
    });
  }, [product.slug, product.id]);

  const options = getAvailableOptions(product);
  const initialVariant =
    product.variants.find((v) => v.sku === initialSku) ?? product.variants[0];

  const [selectedCct, setSelectedCct] = useState<string | null>(initialVariant?.cct ?? null);
  const [selectedWattage, setSelectedWattage] = useState<string | null>(
    initialVariant?.wattage ?? null,
  );
  const [selectedFinish, setSelectedFinish] = useState<string | null>(
    (initialVariant?.finish ?? "default").toLowerCase(),
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const selectedVariant = useMemo(
    () =>
      findVariantBySelections(product, {
        cct: selectedCct,
        wattage: selectedWattage,
        finish: selectedFinish,
      }),
    [product, selectedCct, selectedWattage, selectedFinish],
  );

  const price = getPriceDisplay(product, selectedVariant ?? undefined, locale);
  const name = getProductName(product, locale);
  const categoryLabel = getCategoryLabel(product, locale);
  const inWishlist = has(product.slug);
  const outOfStock = selectedVariant?.stockStatus === "OUT_OF_STOCK";

  const images = useMemo(() => collectGalleryImages(product), [product]);

  const keySpecs = useMemo(
    () => buildKeySpecRows(product, selectedVariant ?? undefined, locale),
    [product, selectedVariant, locale],
  );

  const description = useMemo(() => buildProductDescription(product, locale), [product, locale]);
  const specRows = useMemo(
    () => buildSpecificationRows(product, selectedVariant ?? undefined, locale),
    [product, selectedVariant, locale],
  );
  const accessories = useMemo(() => extractAccessoryRows(product, locale), [product, locale]);
  const suitableUses = useMemo(() => buildSuitableUses(product, locale), [product, locale]);
  const warrantyText = getWarrantyDisplay(product, locale);

  useEffect(() => {
    const key = "osool-recent";
    try {
      const raw = localStorage.getItem(key);
      const list = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [product.slug, ...list.filter((s) => s !== product.slug)].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [product.slug]);

  const handleAddToCart = () => {
    if (!selectedVariant || outOfStock) return;
    addLine({
      productId: product.id,
      productSlug: product.slug,
      variantId: selectedVariant.id,
      variantSku: selectedVariant.sku,
      quantity,
      displayName: name,
      imageUrl: selectedVariant.imageUrl ?? product.variants[0]?.imageUrl ?? null,
      variantNote: selectedVariant.cct ? `${selectedVariant.cct}K` : null,
    });
    showAddedFeedback({
      productName: name,
      productSlug: product.slug,
      variantSku: selectedVariant.sku,
      quantity,
      imageUrl: selectedVariant.imageUrl ?? product.variants[0]?.imageUrl ?? null,
      variantNote: selectedVariant.cct ? `${selectedVariant.cct}K` : null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedProducts = related.length ? related : completeTheLook;

  return (
    <>
      <div className="container-page py-8 pb-mobile-sticky-extra md:py-12 md:pb-12">
        <nav className="mb-6 text-meta" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-brand-black-soft">
                {locale === "ar" ? "اصول التميز" : "Osool Altamaioz"}
              </Link>
            </li>
            <li className="text-text-secondary/60" aria-hidden="true">
              /
            </li>
            <li>
              <Link href="/products" className="hover:text-brand-black-soft">
                {tCatalog("allProducts")}
              </Link>
            </li>
            <li className="text-text-secondary/60" aria-hidden="true">
              /
            </li>
            <li>
              <Link
                href={`/categories/${product.primaryCategory}`}
                className="hover:text-brand-black-soft"
              >
                {categoryLabel}
              </Link>
            </li>
            <li className="text-text-secondary/60" aria-hidden="true">
              /
            </li>
            <li className="text-text-primary">{name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <PdpGallery
            images={images}
            name={name}
            locale={locale}
            categorySlugs={product.categorySlugs}
            productType={product.productType}
            activeIndex={activeImage}
            onActiveIndexChange={setActiveImage}
          />

          <div className="space-y-6">
            <div className="space-y-2">
              <Link
                href={`/categories/${product.primaryCategory}`}
                className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand-orange hover:underline"
              >
                {categoryLabel}
              </Link>
              {product.series && (
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-text-secondary">
                  {product.series}
                </p>
              )}
              <h1 className="heading-section text-balance">{name}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-b border-border pb-5">
              <p className="text-2xl font-semibold tabular-nums tracking-tight">{price.text}</p>
              {price.isDemo && (
                <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
                  {tCatalog("demoPrice")}
                </span>
              )}
              {!price.isConfirmed && !price.isDemo && (
                <span className="text-xs text-text-secondary">{tCatalog("priceUnavailable")}</span>
              )}
              {product.isOnOffer && (
                <span className="rounded-md bg-brand-orange px-2 py-0.5 text-xs text-white">
                  {tCatalog("offer")}
                </span>
              )}
            </div>

            <dl className="grid gap-2 text-sm">
              {selectedVariant?.sku && (
                <Row label={t("sku")} value={selectedVariant.sku} />
              )}
              {(selectedVariant?.modelNumber || selectedVariant?.sku) && (
                <Row
                  label={t("model")}
                  value={selectedVariant?.modelNumber ?? selectedVariant?.sku ?? ""}
                />
              )}
              {product.series && <Row label={t("series")} value={product.series} />}
              <Row
                label={t("availability")}
                value={
                  selectedVariant
                    ? selectedVariant.stockStatus === "IN_STOCK"
                      ? t("inStock")
                      : selectedVariant.stockStatus === "LOW_STOCK"
                        ? t("lowStock")
                        : t("outOfStock")
                    : t("variantUnavailable")
                }
              />
            </dl>

            {keySpecs.length > 0 && (
              <div className="rounded-xl border border-border bg-[#faf9f7] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  {t("keySpecs")}
                </p>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {keySpecs.map((row) => (
                    <div key={row.key} className="min-w-0">
                      <dt className="text-xs text-text-secondary">{row.key}</dt>
                      <dd className="text-sm font-medium">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {options.cct.length > 0 && (
              <OptionGroup title={t("selectCct")}>
                <div className="flex flex-wrap gap-2">
                  {options.cct.map((cct) => {
                    const available = isCombinationAvailable(product, {
                      cct,
                      wattage: selectedWattage,
                      finish: selectedFinish,
                    });
                    return (
                      <CctOptionButton
                        key={cct}
                        cct={cct}
                        locale={locale}
                        selected={selectedCct === cct}
                        disabled={!available}
                        onClick={() => setSelectedCct(cct)}
                      />
                    );
                  })}
                </div>
              </OptionGroup>
            )}

            {options.wattage.length > 1 && (
              <OptionGroup title={t("selectWattage")}>
                <div className="flex flex-wrap gap-2">
                  {options.wattage.map((w) => {
                    const available = isCombinationAvailable(product, {
                      cct: selectedCct,
                      wattage: w,
                      finish: selectedFinish,
                    });
                    return (
                      <OptionButton
                        key={w}
                        selected={selectedWattage === w}
                        disabled={!available}
                        onClick={() => setSelectedWattage(w)}
                      >
                        {w}
                      </OptionButton>
                    );
                  })}
                </div>
              </OptionGroup>
            )}

            {options.finish.filter((f) => f !== "default").length > 0 && (
              <OptionGroup title={t("selectFinish")}>
                <div className="flex flex-wrap gap-2">
                  {options.finish.map((f) => {
                    const available = isCombinationAvailable(product, {
                      cct: selectedCct,
                      wattage: selectedWattage,
                      finish: f,
                    });
                    return (
                      <OptionButton
                        key={f}
                        selected={selectedFinish === f}
                        disabled={!available}
                        onClick={() => setSelectedFinish(f)}
                      >
                        {f === "black" ? (locale === "ar" ? "أسود" : "Black") : f}
                      </OptionButton>
                    );
                  })}
                </div>
              </OptionGroup>
            )}

            {!selectedVariant && (
              <p className="rounded-lg border border-brand-orange/30 bg-brand-orange/5 px-4 py-3 text-sm text-brand-orange">
                {t("invalidCombination")}
              </p>
            )}

            <div className="hidden md:block">
              <PurchaseControls
                quantity={quantity}
                setQuantity={setQuantity}
                outOfStock={outOfStock}
                added={added}
                inWishlist={inWishlist}
                onAdd={handleAddToCart}
                onWishlist={() => toggle(product.slug)}
                disabled={!selectedVariant}
              />
            </div>

            <PdpProductActions
              product={product}
              variant={selectedVariant ?? undefined}
              locale={localeKey}
            />

            <div className="rounded-xl border border-border bg-white p-4 text-sm">
              <p className="font-semibold">{t("warranty")}</p>
              <p className="mt-1 text-meta leading-relaxed">
                {warrantyText ?? t("warrantyFallback")}
              </p>
            </div>
          </div>
        </div>

        <PdpDetailSections
          sections={[
            {
              id: "description",
              title: t("descriptionTitle"),
              hidden: !description,
              content: <p className="text-sm leading-relaxed text-text-primary">{description}</p>,
            },
            {
              id: "specs",
              title: t("specifications"),
              hidden: specRows.length === 0,
              content: <SpecTable rows={specRows} />,
            },
            {
              id: "accessories",
              title: t("accessoriesTitle"),
              hidden: accessories.length === 0,
              content: <SpecTable rows={accessories} />,
            },
            {
              id: "uses",
              title: t("suitableForTitle"),
              hidden: suitableUses.length === 0,
              content: <BulletList items={suitableUses} />,
            },
            {
              id: "support",
              title: t("shippingSupportTitle"),
              content: (
                <div className="space-y-4 text-sm leading-relaxed text-text-primary">
                  <p>{t("shippingPlaceholder")}</p>
                  <p>{warrantyText ?? t("warrantyFallback")}</p>
                  <p>{t("returnsPlaceholder")}</p>
                </div>
              ),
            },
          ]}
        />

        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-20">
            <h2 className="heading-subsection mb-6">{t("related")}</h2>
            <ProductGrid products={relatedProducts} locale={locale} />
          </section>
        )}

        <RecentlyViewedSection locale={locale} currentSlug={product.slug} />
      </div>

      <MobileStickyBar
        name={name}
        price={price.text}
        outOfStock={outOfStock}
        added={added}
        onAdd={handleAddToCart}
        disabled={!selectedVariant}
      />
    </>
  );
}

function PurchaseControls({
  quantity,
  setQuantity,
  outOfStock,
  added,
  inWishlist,
  onAdd,
  onWishlist,
  disabled,
}: {
  quantity: number;
  setQuantity: (n: number) => void;
  outOfStock: boolean;
  added: boolean;
  inWishlist: boolean;
  onAdd: () => void;
  onWishlist: () => void;
  disabled?: boolean;
}) {
  const t = useTranslations("pdp");
  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <div className="inline-flex h-11 items-center rounded-lg border border-border">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center text-lg"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          aria-label="-"
        >
          −
        </button>
        <span className="min-w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center text-lg"
          onClick={() => setQuantity(quantity + 1)}
          aria-label="+"
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={outOfStock || disabled}
        onClick={onAdd}
        className="btn-cta h-11 flex-1 md:flex-none md:min-w-[12rem]"
      >
        {added ? t("addedToCart") : t("addToCart")}
      </button>
      <button
        type="button"
        onClick={onWishlist}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-colors",
          inWishlist && "border-brand-orange text-brand-orange",
        )}
        aria-label={t("wishlist")}
      >
        <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} strokeWidth={1.5} />
      </button>
    </div>
  );
}

function MobileStickyBar({
  name,
  price,
  outOfStock,
  added,
  onAdd,
  disabled,
}: {
  name: string;
  price: string;
  outOfStock: boolean;
  added: boolean;
  onAdd: () => void;
  disabled?: boolean;
}) {
  const t = useTranslations("pdp");
  return (
    <div className="bottom-mobile-nav fixed inset-x-0 z-30 border-t border-border bg-white/95 p-3 shadow-[0_-4px_24px_rgba(8,8,8,0.04)] backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-text-secondary">{name}</p>
          <p className="text-sm font-semibold tabular-nums">{price}</p>
        </div>
        <button
          type="button"
          disabled={outOfStock || disabled}
          onClick={onAdd}
          className="btn-cta h-10 shrink-0 px-4"
        >
          {added ? t("addedToCart") : t("addToCart")}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="min-w-[5rem] text-text-secondary">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function OptionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-sm font-medium">{title}</p>
      {children}
    </div>
  );
}

function CctOptionButton({
  cct,
  locale,
  selected,
  disabled,
  onClick,
}: {
  cct: string;
  locale: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const key = cct.toUpperCase() as keyof typeof designTokens.cct;
  const token = designTokens.cct[key];
  const moodLabel = token ? (locale === "ar" ? token.ar : token.en) : cct;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-w-[5.25rem] flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 transition-colors",
        selected
          ? "border-brand-black-soft bg-brand-black-soft/5 ring-1 ring-brand-black-soft"
          : "border-border hover:border-brand-gray",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span
        className="h-6 w-6 rounded-full border border-black/10 shadow-inner"
        style={{ background: token?.hex ?? "#E0DFDD" }}
        aria-hidden="true"
      />
      <span className="text-xs font-semibold tabular-nums">{cct}</span>
      <span className="text-[10px] text-text-secondary">{moodLabel}</span>
    </button>
  );
}

function OptionButton({
  children,
  selected,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-lg border px-3.5 py-2 text-sm transition-colors",
        selected
          ? "border-brand-black-soft bg-brand-black-soft/5 font-medium ring-1 ring-brand-black-soft"
          : "border-border hover:border-brand-gray",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {children}
    </button>
  );
}
