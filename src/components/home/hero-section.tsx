"use client";

import { Headphones, ShieldCheck, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { HeroVisual } from "@/components/home/hero-visual";
import {
  HomeButtonOutlineLight,
  HomeButtonPrimary,
} from "@/components/home/home-ui";

export function HeroSection() {
  const t = useTranslations("home");

  const trustItems = [
    { icon: ShieldCheck, label: t("trustWarranty") },
    { icon: Truck, label: t("trustShipping") },
    { icon: Headphones, label: t("trustSupport") },
  ];

  return (
    <section className="relative overflow-hidden bg-[#080808]">
      <div className="home-hero-split grid lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="relative order-1 min-h-[48svh] sm:min-h-[52svh] lg:order-none lg:min-h-0">
          <HeroVisual priority />
        </div>

        <div className="order-2 flex flex-col justify-center px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16 xl:px-14 xl:py-20">
          <p className="home-eyebrow mb-5 lg:mb-6">{t("heroEyebrow")}</p>
          <h1 className="home-heading-display text-white">
            <span className="block">{t("heroTitleLine1")}</span>
            <span className="mt-2 block text-brand-orange">{t("heroTitleLine2")}</span>
          </h1>
          <p className="mt-6 max-w-md text-[0.9375rem] leading-[1.8] text-white/70 lg:mt-7 lg:max-w-lg lg:text-base lg:leading-[1.85]">
            {t("heroSubtitle")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-11">
            <HomeButtonPrimary href="/categories/indoor" className="home-btn-hero-primary">
              {t("heroCtaPrimary")}
            </HomeButtonPrimary>
            <HomeButtonOutlineLight href="/spaces" className="home-btn-hero-secondary">
              {t("heroCtaSecondary")}
            </HomeButtonOutlineLight>
          </div>

          <ul className="mt-10 grid gap-4 border-t border-white/10 pt-7 sm:grid-cols-3 lg:mt-12 lg:pt-8">
            {trustItems.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="home-trust-item flex items-start gap-3 text-[11px] leading-relaxed text-white/60 md:text-xs"
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
    </section>
  );
}
