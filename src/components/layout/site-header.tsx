"use client";

import { Heart, User } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CartIconButton } from "@/components/commerce/cart-icon-button";
import { useCart } from "@/components/commerce/cart-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { IconLink, SearchBar } from "@/components/layout/search-bar";

export function SiteHeader() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("common");
  const [menuOpen, setMenuOpen] = useState(false);
  const { count: cartCount } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 shadow-[var(--shadow-header)] backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="hidden border-b border-border/80 bg-brand-black-soft text-white md:block">
          <div className="container-page flex h-9 items-center justify-between text-[11px] tracking-wide text-white/80">
            <p>{locale === "ar" ? "شحن محلي — جودة فاخرة — دعم متخصص" : "Local shipping — premium quality — specialist support"}</p>
            <LanguageSwitcher label={t("language")} className="border-white/15 text-white/80 hover:border-white/40 hover:text-white" />
          </div>
        </div>

        <div className="container-page">
          <div className="flex h-[var(--header-height)] items-center gap-2 md:gap-4">
            <button
              type="button"
              className="icon-btn-premium lg:hidden"
              aria-label={t("menu")}
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </button>

            <Logo locale={locale} className="min-w-0 max-w-[9.5rem] shrink truncate sm:max-w-none" compact />

            <div className="hidden flex-1 md:block">
              <SearchBar className="max-w-xl lg:max-w-2xl" />
            </div>

            <div className="ms-auto flex items-center gap-0.5 md:gap-1">
              <div className="md:hidden">
                <LanguageSwitcher label={t("language")} />
              </div>
              <IconLink href="/wishlist" label={t("wishlist")}>
                <Heart strokeWidth={1.5} className="h-5 w-5" />
              </IconLink>
              <CartIconButton label={t("cart")} count={cartCount} />
              <IconLink href="/account" label={t("account")}>
                <User strokeWidth={1.5} className="h-5 w-5" />
              </IconLink>
            </div>
          </div>

          <div className="pb-3 md:hidden">
            <SearchBar compact />
          </div>

          <div className="hidden border-t border-border/80 py-1 lg:block">
            <MegaMenu />
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
