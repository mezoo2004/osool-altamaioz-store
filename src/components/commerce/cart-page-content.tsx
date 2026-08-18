"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/commerce/cart-provider";
import { useValidatedCart } from "@/components/commerce/use-validated-cart";
import { ProductImagePlaceholder } from "@/components/ui/product-image-placeholder";
import { formatCurrency } from "@/lib/utils";

export function CartPageContent({ locale }: { locale: string }) {
  const t = useTranslations("commerce.cart");
  const { lines, isHydrated, updateQuantity, removeLine, clearCart } = useCart();
  const { cart, loading } = useValidatedCart(lines, isHydrated);

  if (!isHydrated || loading) {
    return (
      <div className="container-page py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-muted" />
        <div className="mt-8 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-16 text-center md:py-20">
        <h1 className="heading-section">{t("title")}</h1>
        <p className="mt-4 text-meta">{t("empty")}</p>
        <Link href="/categories/indoor" className="btn-cta mt-8">
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-6">
        <h1 className="heading-section">{t("title")}</h1>
        <button type="button" onClick={clearCart} className="text-sm text-text-secondary hover:text-brand-orange">
          {t("clear")}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem]">
        <ul className="space-y-3">
          {cart?.lines.map((line) => (
            <li key={line.variantSku} className="card-surface p-4 md:p-5">
              <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border md:h-24 md:w-24">
                  <ProductImagePlaceholder locale={locale} />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${line.productSlug}`}
                    className="font-medium leading-snug hover:text-brand-orange"
                  >
                    {locale === "ar" ? line.nameAr : line.nameEn}
                  </Link>
                  <p className="mt-1 text-meta">{line.variantSku}</p>
                  {line.cct && (
                    <p className="text-meta">
                      CCT: {line.cct}
                      {line.wattage ? ` · ${line.wattage}` : ""}
                    </p>
                  )}
                  {line.issues.length > 0 && (
                    <p className="mt-2 text-xs text-brand-orange">
                      {line.issues.includes("price_unavailable")
                        ? t("priceUnavailable")
                        : line.issues.includes("out_of_stock")
                          ? t("outOfStock")
                          : t("unavailable")}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="inline-flex h-10 items-center rounded-lg border border-border">
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center"
                        onClick={() => updateQuantity(line.variantSku, line.quantity - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={line.quantity}
                        onChange={(e) =>
                          updateQuantity(line.variantSku, Number(e.target.value) || 1)
                        }
                        className="w-10 text-center text-sm tabular-nums"
                      />
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center"
                        onClick={() => updateQuantity(line.variantSku, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-text-secondary hover:text-brand-orange"
                      onClick={() => removeLine(line.variantSku)}
                    >
                      {t("remove")}
                    </button>
                    <p className="ms-auto text-price">
                      {line.lineTotal != null
                        ? formatCurrency(line.lineTotal, locale)
                        : t("priceUnavailable")}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card-surface h-fit p-5">
          <h2 className="mb-4 text-sm font-semibold">{t("summary")}</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">{t("subtotal")}</dt>
              <dd className="tabular-nums">{cart ? formatCurrency(cart.subtotal, locale) : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">{t("vat")}</dt>
              <dd className="tabular-nums">{cart ? formatCurrency(cart.vatTotal, locale) : "—"}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-semibold">
              <dt>{t("total")}</dt>
              <dd className="tabular-nums">{cart ? formatCurrency(cart.grandTotal, locale) : "—"}</dd>
            </div>
          </dl>
          {cart?.hasPriceUnavailable && !cart.isDevelopmentMode && (
            <p className="mt-4 text-xs text-brand-orange">{t("checkoutBlockedPrice")}</p>
          )}
          {cart?.canCheckout ? (
            <Link href="/checkout" className="btn-cta mt-6 w-full">
              {t("checkout")}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-surface-muted text-sm text-text-secondary"
            >
              {t("checkout")}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
