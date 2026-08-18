"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { IconLink, SearchBar } from "@/components/layout/search-bar";
import { useCart } from "@/components/commerce/cart-provider";

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
              className="icon-btn lg:hidden"
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
                <HeartIcon />
              </IconLink>
              <IconLink href="/cart" label={t("cart")}>
                <span className="relative">
                  <CartIcon />
                  {cartCount > 0 && (
                    <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold leading-none text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </span>
              </IconLink>
              <IconLink href="/account" label={t("account")}>
                <UserIcon />
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

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.35-7-9.5a4.5 4.5 0 0 1 8-2.74A4.5 4.5 0 0 1 19 10.5C19 15.65 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6h15l-1.5 9H8L6 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M6 6 5 3H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="19" r="1.2" fill="currentColor" />
      <circle cx="18" cy="19" r="1.2" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
