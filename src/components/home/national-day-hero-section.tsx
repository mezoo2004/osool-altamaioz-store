"use client";

import { useLocale, useTranslations } from "next-intl";
import { NationalDayHeroBackdrop } from "@/components/home/national-day-hero-visual";
import { HomeButtonOutlineLight, HomeButtonPrimary } from "@/components/home/home-ui";
import { cn } from "@/lib/utils";

export function NationalDayHeroSection() {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("home.nationalDay");

  return (
    <section
      className={cn("nd-hero nd-hero--immersive relative isolate overflow-hidden bg-[#0B3D2E]", locale === "en" && "nd-hero--en")}
      aria-labelledby="nd-hero-heading"
    >
      <NationalDayHeroBackdrop locale={locale} priority />

      <div className="container-home relative z-10">
        <div className="nd-hero-stage flex min-h-[min(34rem,88svh)] flex-col justify-end px-0 py-8 sm:min-h-[min(36rem,86svh)] sm:py-10 md:min-h-[min(38rem,84svh)] lg:min-h-[min(42rem,82vh)] lg:max-w-[34rem] lg:justify-center lg:py-14 xl:max-w-[36rem] xl:py-16">
          <div className="nd-hero-copy mx-auto flex w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-[#0B3D2E]/50 p-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:p-6 lg:mx-0 lg:max-w-none lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:text-start lg:shadow-none lg:backdrop-blur-none">
            <span className="nd-hero-badge mb-4 inline-flex w-fit self-center rounded-full border border-white/20 bg-[#0B3D2E]/45 px-3.5 py-1 text-[11px] font-medium tracking-wide text-white/95 backdrop-blur-md lg:self-start">
              {t("limitedTag")}
            </span>
            <p className="nd-hero-eyebrow mb-2 text-sm font-semibold tracking-wide text-[#EA5A2D] sm:text-[0.9375rem]">
              {t("eyebrow")}
            </p>
            <h1
              id="nd-hero-heading"
              className="nd-hero-title home-heading-display text-[clamp(1.75rem,6.5vw,3.25rem)] leading-[1.12] text-white"
            >
              {t("headline")}
            </h1>
            <p className="nd-hero-support mt-2 text-base font-medium text-white/92 sm:text-lg">{t("supportHeadline")}</p>
            <p className="nd-hero-description mt-4 text-[0.9375rem] leading-relaxed text-white/80 sm:text-base">
              {t("description")}
            </p>

            <div className="nd-hero-actions mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <HomeButtonPrimary
                href="/offers"
                className="nd-hero-cta-primary home-btn-hero-primary min-h-12 w-full justify-center sm:min-h-11 sm:w-auto"
              >
                {t("ctaPrimary")}
              </HomeButtonPrimary>
              <HomeButtonOutlineLight
                href="/products"
                className="nd-hero-cta-secondary home-btn-hero-secondary min-h-12 w-full justify-center sm:min-h-11 sm:w-auto"
              >
                {t("ctaSecondary")}
              </HomeButtonOutlineLight>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
