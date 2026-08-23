"use client";

import { useState } from "react";
import { Heart, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { CartIconButton } from "@/components/commerce/cart-icon-button";
import { useCart } from "@/components/commerce/cart-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { IconLink, SearchBar } from "@/components/layout/search-bar";
import { Link, usePathname } from "@/i18n/navigation";
import { homeMainNav } from "@/lib/home/home-navigation";
import { cn } from "@/lib/utils";

export function HomeHeader() {
  const locale = useLocale() as "ar" | "en";
  const pathname = usePathname();
  const t = useTranslations("common");
  const tHome = useTranslations("home");
  const tNav = useTranslations("homeNav");
  const [menuOpen, setMenuOpen] = useState(false);
  const { count: cartCount } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white">
        <div className="border-b border-black/90 bg-black text-white">
          <div className="container-home flex h-8 items-center justify-between text-[10px] tracking-[0.06em] text-white/72 md:text-[11px]">
            <p className="truncate">{tHome("utilityBar")}</p>
            <LanguageSwitcher
              label={t("language")}
              className="shrink-0 border-white/15 text-white/72 hover:border-white/35 hover:text-white"
            />
          </div>
        </div>

        <div className="border-b border-[#E0DFDD]/80">
          <div className="container-home">
            <div className="flex h-[4.25rem] items-center gap-3 md:h-[4.75rem] md:gap-5 lg:h-20">
              <button
                type="button"
                className="icon-btn lg:hidden"
                aria-label={t("menu")}
                onClick={() => setMenuOpen(true)}
              >
                <MenuIcon />
              </button>

              <Logo locale={locale} className="min-w-0 shrink truncate sm:max-w-none" />

              <div className="hidden flex-1 justify-center px-4 lg:flex">
                <SearchBar className="home-header-search max-w-2xl xl:max-w-3xl" />
              </div>

              <div className="ms-auto flex items-center gap-1 md:gap-1.5">
                <div className="lg:hidden">
                  <LanguageSwitcher label={t("language")} />
                </div>
                <IconLink href="/account" label={t("account")}>
                  <User strokeWidth={1.5} className="header-icon-svg" />
                </IconLink>
                <IconLink href="/wishlist" label={t("wishlist")}>
                  <Heart strokeWidth={1.5} className="header-icon-svg" />
                </IconLink>
                <CartIconButton label={t("cart")} count={cartCount} />
              </div>
            </div>

            <div className="pb-3 lg:hidden">
              <SearchBar compact className="home-header-search" />
            </div>
          </div>
        </div>

        <nav
          className="hidden border-b border-[#E0DFDD]/70 lg:block"
          aria-label={locale === "ar" ? "التنقل الرئيسي" : "Main navigation"}
        >
          <div className="container-home">
            <ul className="flex flex-wrap items-center gap-x-1 xl:gap-x-2">
              {homeMainNav.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={cn(
                        "home-nav-link relative inline-flex h-11 items-center px-3 text-[13px] font-medium transition-colors xl:px-3.5 xl:text-sm",
                        isActive ? "text-brand-orange" : "text-brand-black-soft hover:text-brand-black",
                      )}
                    >
                      {tNav(item.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
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
