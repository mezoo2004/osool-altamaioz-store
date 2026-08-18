"use client";

import { AiChatWidget } from "@/components/assistant/ai-chat-widget";
import { CartFeedbackProvider } from "@/components/commerce/cart-feedback-provider";
import { CartProvider } from "@/components/commerce/cart-provider";
import { WishlistProvider } from "@/components/commerce/wishlist-provider";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { usePathname } from "@/i18n/navigation";

type StorefrontShellClientProps = {
  locale: "ar" | "en";
  children: React.ReactNode;
};

export function StorefrontShellClient({ locale, children }: StorefrontShellClientProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <WishlistProvider>
      <CartProvider>
        <CartFeedbackProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-orange focus:px-4 focus:py-2 focus:text-sm focus:text-white"
          >
            {locale === "ar" ? "تخطي إلى المحتوى" : "Skip to content"}
          </a>
          <div className="flex min-h-screen flex-col">
            {isHome ? <HomeHeader /> : <SiteHeader />}
            <main id="main-content" className="flex-1 pb-mobile-nav md:pb-0">
              {children}
            </main>
            {isHome ? <HomeFooter locale={locale} /> : <SiteFooter locale={locale} />}
            <MobileBottomNav />
          </div>
          <AiChatWidget />
        </CartFeedbackProvider>
      </CartProvider>
    </WishlistProvider>
  );
}
