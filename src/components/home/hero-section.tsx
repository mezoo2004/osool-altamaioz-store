"use client";

import { Headphones, ShieldCheck, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeroVisual } from "@/components/home/hero-visual";
import { PromoCard } from "@/components/home/promo-card";
import {
  HomeButtonOutlineLight,
  HomeButtonPrimary,
} from "@/components/home/home-ui";
import { getActiveHomePromoCampaigns } from "@/lib/promo/promo-campaign";

type HeroSectionProps = {
  heroVideoSrc?: string | null;
};

export function HeroSection({ heroVideoSrc = null }: HeroSectionProps) {
  const t = useTranslations("home");
  const promos = getActiveHomePromoCampaigns();

  const trustItems = [
    { icon: ShieldCheck, label: t("trustWarranty") },
    { icon: Truck, label: t("trustShipping") },
    { icon: Headphones, label: t("trustSupport") },
  ];

  return (
    <section className="relative overflow-hidden bg-[#080808]">
      <div className="home-hero-ecommerce grid lg:grid-cols-[1fr_min(22rem,28vw)] lg:items-stretch">
        <div className="relative min-h-[52svh] lg:min-h-[clamp(28rem,78vh,48rem)]">
          <HeroVisual
            priority
            videoSrc={heroVideoSrc}
            className="absolute inset-0 h-full w-full"
          />
          <div className="home-hero-ecommerce-vignette pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative z-10 flex min-h-[52svh] flex-col justify-end px-5 pb-10 pt-24 sm:px-8 sm:pb-12 lg:min-h-[clamp(28rem,78vh,48rem)] lg:px-10 lg:pb-14 xl:px-14">
            <p className="home-eyebrow mb-4 text-white/85 lg:mb-5">{t("heroEyebrow")}</p>
            <h1 className="home-heading-display max-w-2xl text-white">
              <span className="block">{t("heroTitleLine1")}</span>
              <span className="mt-2 block text-brand-orange">{t("heroTitleLine2")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[0.9375rem] leading-[1.8] text-white/72 lg:mt-6 lg:text-base lg:leading-[1.85]">
              {t("heroSubtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
              <HomeButtonPrimary href="/products" className="home-btn-hero-primary">
                {t("heroCtaPrimary")}
              </HomeButtonPrimary>
              <HomeButtonOutlineLight href="/spaces" className="home-btn-hero-secondary">
                {t("heroCtaSecondary")}
              </HomeButtonOutlineLight>
            </div>

            <ul className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3 lg:mt-10 lg:pt-7">
              {trustItems.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="home-trust-item flex items-start gap-3 text-[11px] leading-relaxed text-white/58 md:text-xs"
                >
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/6 ring-1 ring-white/10">
                    <Icon className="h-4 w-4 text-brand-orange" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="pt-1">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {promos.length > 0 ? (
          <div className="flex flex-col gap-4 border-t border-white/8 bg-[#080808] p-5 sm:p-6 lg:border-s lg:border-t-0 lg:p-6 xl:p-7">
            {promos.map((campaign) => (
              <PromoCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
