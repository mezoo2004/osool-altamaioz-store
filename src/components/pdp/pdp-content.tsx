"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/commerce/cart-provider";
import { useCartFeedback } from "@/components/commerce/cart-feedback-provider";
import { useWishlist } from "@/components/commerce/wishlist-provider";
import { ProductGrid } from "@/components/catalog/product-card";
import {
  findVariantBySelections,
  getAvailableOptions,
  getPriceDisplay,
  getProductName,
  isCombinationAvailable,
} from "@/lib/catalog/display";
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
  const { addLine } = useCart();
  const { showAddedFeedback } = useCartFeedback();
  const { has, toggle } = useWishlist();

  const relatedProducts = related;
  const lookProducts = completeTheLook;
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
  const inWishlist = has(product.slug);
  const outOfStock = selectedVariant?.stockStatus === "OUT_OF_STOCK";

  const images = useMemo(() => {
    const urls = product.variants
      .map((v) => v.imageUrl)
      .filter(Boolean) as string[];
    if (!urls.length) return [null];
    return [...new Set(urls)];
  }, [product.variants]);

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
            <li className="text-text-secondary/60" aria-hidden="true">/</li>
            <li>
              <Link href={`/categories/${product.primaryCategory}`} className="hover:text-brand-black-soft">
                {product.primaryCategory}
              </Link>
            </li>
            <li className="text-text-secondary/60" aria-hidden="true">/</li>
            <li className="text-text-primary">{name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <ProductGallery
            images={images}
            activeIndex={activeImage}
            onSelect={setActiveImage}
            name={name}
            locale={locale}
          />

          <div className="space-y-6">
            {product.series && (
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-text-secondary">
                {product.series}
              </p>
            )}
            <h1 className="heading-section">{name}</h1>

            <div className="flex flex-wrap items-center gap-3 border-b border-border pb-5">
              <p className="text-xl font-semibold tabular-nums">{price.text}</p>
              {price.isDemo && (
                <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
                  {tCatalog("demoPrice")}
                </span>
              )}
              {product.isOnOffer && (
                <span className="rounded-md bg-brand-orange px-2 py-0.5 text-xs text-white">
                  {tCatalog("offer")}
                </span>
              )}
            </div>

            <dl className="grid gap-2.5 text-sm">
              <Row label={t("sku")} value={selectedVariant?.sku ?? "—"} />
              <Row label={t("model")} value={selectedVariant?.modelNumber ?? selectedVariant?.sku ?? "—"} />
              <Row label={t("series")} value={product.series ?? "—"} />
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
              />
            </div>

            <InfoTabs locale={locale} specs={product.specs} />
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-20">
            <h2 className="heading-subsection mb-6">{t("related")}</h2>
            <ProductGrid products={relatedProducts} locale={locale} />
          </section>
        )}

        {lookProducts.length > 0 && (
          <section className="mt-16 md:mt-20">
            <h2 className="heading-subsection mb-6">{t("completeTheLook")}</h2>
            <ProductGrid products={lookProducts} locale={locale} />
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
      />
    </>
  );
}

function ProductGallery({
  images,
  activeIndex,
  onSelect,
  name,
  locale,
}: {
  images: (string | null)[];
  activeIndex: number;
  onSelect: (i: number) => void;
  name: string;
  locale: string;
}) {
  const active = images[activeIndex] ?? null;
  return (
    <div className="space-y-3">
      <div className="aspect-[4/5] overflow-hidden rounded-xl border border-border bg-surface-muted md:aspect-square">
        {active ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={active} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] text-text-secondary"
            style={{
              backgroundImage:
                "linear-gradient(rgba(8,8,8,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(8,8,8,0.03) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-brand-gray/40" aria-hidden="true">
              <rect x="6" y="10" width="20" height="14" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M16 6v4M12 8h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span>{locale === "ar" ? "الصورة غير متوفرة" : "Image unavailable"}</span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === activeIndex ? "border-brand-black-soft" : "border-border hover:border-brand-gray",
              )}
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="" className="h-full w-full object-cover" />
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
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
}: {
  quantity: number;
  setQuantity: (n: number) => void;
  outOfStock: boolean;
  added: boolean;
  inWishlist: boolean;
  onAdd: () => void;
  onWishlist: () => void;
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
        disabled={outOfStock}
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
        ♥
      </button>
    </div>
  );
}

function InfoTabs({
  locale,
  specs,
}: {
  locale: string;
  specs: ProductDetail["specs"];
}) {
  const t = useTranslations("pdp");
  return (
    <div className="card-surface divide-y divide-border">
      <InfoSection title={t("shipping")} body={t("shippingPlaceholder")} />
      <InfoSection title={t("warranty")} body={t("warrantyPlaceholder")} />
      <InfoSection title={t("returns")} body={t("returnsPlaceholder")} />
      <InfoSection title={t("installments")} body={t("installmentsPlaceholder")} />
      {specs.length > 0 && (
        <section className="p-5">
          <h2 className="mb-3 text-sm font-semibold">{t("specifications")}</h2>
          <dl className="grid gap-0">
            {specs.map((spec) => (
              <div
                key={spec.keyEn}
                className="grid grid-cols-2 gap-3 border-b border-border py-2.5 text-sm last:border-0"
              >
                <dt className="text-text-secondary">
                  {locale === "ar" ? spec.keyAr : spec.keyEn}
                </dt>
                <dd className="font-medium">{locale === "ar" ? spec.valueAr : spec.valueEn}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

function InfoSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="p-5">
      <h2 className="mb-1.5 text-sm font-semibold">{title}</h2>
      <p className="text-meta">{body}</p>
    </section>
  );
}

function MobileStickyBar({
  name,
  price,
  outOfStock,
  added,
  onAdd,
}: {
  name: string;
  price: string;
  outOfStock: boolean;
  added: boolean;
  onAdd: () => void;
}) {
  const t = useTranslations("pdp");
  return (
    <div
      className="bottom-mobile-nav fixed inset-x-0 z-30 border-t border-border bg-white/95 p-3 shadow-[0_-4px_24px_rgba(8,8,8,0.04)] backdrop-blur md:hidden"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-text-secondary">{name}</p>
          <p className="text-sm font-semibold tabular-nums">{price}</p>
        </div>
        <button
          type="button"
          disabled={outOfStock}
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
