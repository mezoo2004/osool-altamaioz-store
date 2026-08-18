"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ProductGrid, ProductGridSkeleton } from "@/components/catalog/product-card";
import { AccountPageShell } from "@/components/commerce/account-page-shell";
import { useWishlist } from "@/components/commerce/wishlist-provider";
import { EmptyState } from "@/components/ui/empty-state";
import type { Product } from "@/lib/catalog/types";

export function WishlistPageContent({ locale }: { locale: string }) {
  const t = useTranslations("commerce.wishlist");
  const { productIds: productSlugs, isHydrated } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;
    if (!productSlugs.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    fetch(`/api/products/batch?slugs=${encodeURIComponent(productSlugs.join(","))}`)
      .then((r) => r.json())
      .then((data: { products: Product[] }) => {
        setProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productSlugs, isHydrated]);

  if (!isHydrated || loading) {
    return (
      <div className="container-page py-8 md:py-12">
        <div className="mb-8 h-8 w-40 animate-pulse rounded-lg bg-surface-muted" />
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  if (!productSlugs.length) {
    return (
      <div className="container-page py-8 md:py-12">
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="heading-section">{t("title")}</h1>
        </div>
        <EmptyState
          title={t("empty")}
          action={{ label: t("shop"), href: "/categories/indoor" }}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="heading-section">{t("title")}</h1>
        <p className="mt-2 text-meta tabular-nums">
          {products.length} {locale === "ar" ? "منتج" : "items"}
        </p>
      </div>
      <ProductGrid products={products} locale={locale} />
    </div>
  );
}

export function AccountOverview({ userName, locale }: { userName: string; locale: string }) {
  const t = useTranslations("commerce.account");
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const links = [
    { href: "/account/profile", label: t("profile"), desc: locale === "ar" ? "بياناتك الشخصية" : "Your personal details" },
    { href: "/account/addresses", label: t("addresses"), desc: locale === "ar" ? "عناوين الشحن" : "Shipping addresses" },
    { href: "/account/orders", label: t("orders"), desc: locale === "ar" ? "سجل الطلبات" : "Order history" },
    { href: "/wishlist", label: t("wishlist"), desc: locale === "ar" ? "منتجاتك المحفوظة" : "Saved products" },
  ];

  return (
    <AccountPageShell locale={locale} title={t("title")} active="overview">
      <p className="mb-8 text-meta">{t("welcome", { name: userName })}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="card-surface group p-5 transition-colors hover:border-brand-gray/50"
          >
            <p className="font-medium group-hover:text-brand-orange">{l.label}</p>
            <p className="mt-1 text-meta">{l.desc}</p>
          </Link>
        ))}
      </div>
      <button type="button" onClick={logout} className="mt-8 text-sm text-text-secondary hover:text-brand-orange">
        {t("signOut")}
      </button>
    </AccountPageShell>
  );
}
