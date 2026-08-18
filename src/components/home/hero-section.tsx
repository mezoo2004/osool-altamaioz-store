"use client";

import { Headphones, ShieldCheck, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { HomeImage } from "@/components/home/home-image";
import {
  HomeButtonOutlineLight,
  HomeButtonPrimary,
} from "@/components/home/home-ui";
import { homeImages } from "@/lib/home/home-images";
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
        {/* Visual — first in DOM = start side (right in RTL) */}
        <div className="relative order-1 min-h-[44svh] sm:min-h-[48svh] lg:order-none lg:min-h-0">
          <HomeImage
            entry={homeImages.hero}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="home-hero-photo"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808]/55 via-transparent to-transparent lg:bg-gradient-to-l lg:from-[#080808]/70 lg:via-[#080808]/15 lg:to-transparent rtl:lg:bg-gradient-to-r"
            aria-hidden="true"
          />
        </div>

        {/* Editorial content panel */}
        <div className="order-2 flex flex-col justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 xl:px-14 xl:py-16">
          <p className="home-eyebrow mb-4 lg:mb-5">{t("heroEyebrow")}</p>
          <h1 className="home-heading-display text-white">
            <span className="block">{t("heroTitleLine1")}</span>
            <span className="mt-1 block text-brand-orange/95">{t("heroTitleLine2")}</span>
          </h1>
          <p className="mt-5 max-w-md text-[0.9375rem] leading-[1.75] text-white/68 lg:mt-6 lg:max-w-lg lg:text-base">
            {t("heroSubtitle")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
            <HomeButtonPrimary href="/categories/indoor">{t("heroCtaPrimary")}</HomeButtonPrimary>
            <HomeButtonOutlineLight href="/spaces">{t("heroCtaSecondary")}</HomeButtonOutlineLight>
          </div>

          <ul className="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3 lg:mt-10 lg:pt-7">
            {trustItems.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-start gap-2.5 text-[11px] text-white/55 md:text-xs">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" strokeWidth={1.5} aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
