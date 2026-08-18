"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { HomeCategoryIcon, HomeArrowIcon } from "@/components/home/home-icons";
import { HomeImage } from "@/components/home/home-image";
import { HomeProductGrid } from "@/components/home/home-product-grid";
import {
  HomeArrowLink,
  HomeButtonAccent,
  HomeButtonInverse,
  HomeSectionHeader,
  SceneHotspot,
} from "@/components/home/home-ui";
import { Link } from "@/i18n/navigation";
import { homeImages } from "@/lib/home/home-images";
import {
  homePrimaryCategories,
  homeSecondaryCategories,
  homepageSpaces,
} from "@/lib/home/home-navigation";
import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function ShopBySpaceSection() {
  const t = useTranslations("home");
  const tSpaces = useTranslations("spaces");
  const tCommon = useTranslations("common");

  return (
    <section className="home-section-y bg-[#faf9f7]">
      <div className="container-home">
        <HomeSectionHeader
          title={t("spacesTitle")}
          subtitle={t("spacesSubtitle")}
          action={<HomeArrowLink href="/spaces">{tCommon("viewAll")}</HomeArrowLink>}
        />

        <div className="home-space-scroll">
          {homepageSpaces.map((space, index) => {
            const imageEntry = homeImages.spaces[space.imageKey];
            const featured = index === 0;

            return (
              <Link
                key={space.key}
                href={`/spaces/${space.slug}`}
                className={cn(
                  "group relative overflow-hidden home-clip-card",
                  "w-[74vw] shrink-0 snap-start sm:w-[46vw]",
                  "md:w-auto md:shrink",
                  featured && "md:col-span-2 md:row-span-2",
                )}
              >
                <div
                  className={cn(
                    "relative overflow-hidden",
                    featured ? "home-space-featured aspect-[4/5] md:aspect-auto" : "home-space-standard aspect-[5/4] md:aspect-auto",
                  )}
                >
                  <HomeImage
                    entry={imageEntry}
                    alt={tSpaces(space.key)}
                    fill
                    sizes={featured ? "(max-width: 768px) 74vw, 40vw" : "(max-width: 768px) 74vw, 22vw"}
                    className="transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/25 to-black/10 transition-colors duration-300 group-hover:from-black/88"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 lg:p-6">
                    <p className="font-mono text-sm font-medium tracking-[0.12em] text-brand-orange">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <p
                        className={cn(
                          "font-medium text-white",
                          featured ? "text-xl sm:text-2xl lg:text-[1.75rem]" : "text-base sm:text-lg lg:text-xl",
                        )}
                      >
                        {tSpaces(space.key)}
                      </p>
                      <span className="mb-0.5 inline-flex h-9 w-9 items-center justify-center border border-white/25 bg-white/8 opacity-80 transition-all duration-300 group-hover:translate-x-0.5 group-hover:border-brand-orange/50 group-hover:opacity-100 rtl:group-hover:-translate-x-0.5 lg:h-10 lg:w-10">
                        <HomeArrowIcon className="h-4 w-4 text-white rtl:rotate-180" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");
  const tSecondary = useTranslations("homeSecondary");

  return (
    <section className="home-section-y-sm bg-white">
      <div className="container-home">
        <HomeSectionHeader title={t("categoriesTitle")} subtitle={t("categoriesSubtitle")} />

        <div className="mb-6 grid grid-cols-2 gap-3 lg:mb-8 lg:grid-cols-4 lg:gap-5">
          {homePrimaryCategories.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className={cn(
                "group home-category-primary flex flex-col justify-between gap-5 p-5 transition-all duration-200 home-clip-card lg:p-7",
                "highlight" in cat && cat.highlight
                  ? "border border-brand-orange/35 bg-white hover:border-brand-orange/55"
                  : "border border-[#E0DFDD]/90 bg-white hover:border-brand-black-soft/20",
              )}
            >
              <HomeCategoryIcon
                type={cat.icon}
                className={cn(
                  "h-10 w-10 lg:h-11 lg:w-11",
                  "accent" in cat && cat.accent ? "text-brand-orange" : "text-brand-black-soft",
                )}
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium leading-snug lg:text-base">{tNav(cat.key)}</span>
                <HomeArrowIcon
                  className={cn(
                    "h-4 w-4 opacity-45 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5",
                    "accent" in cat && cat.accent ? "text-brand-orange" : "text-brand-black-soft",
                  )}
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3 lg:grid-cols-6">
          {homeSecondaryCategories.map((category) => (
            <Link
              key={category.key}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-start gap-3 rounded-md border border-[#E0DFDD]/90 bg-white p-3.5 transition-all duration-200 hover:border-brand-orange/30 lg:p-4"
            >
              <span
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-sm border border-[#E0DFDD]/80 bg-[#faf9f7] transition-colors lg:h-12 lg:w-12",
                  "accent" in category && category.accent && "group-hover:border-brand-orange/35 group-hover:bg-brand-orange/5",
                )}
              >
                <HomeCategoryIcon
                  type={category.icon}
                  className={cn(
                    "h-6 w-6 lg:h-7 lg:w-7",
                    "accent" in category && category.accent ? "text-brand-orange" : "text-brand-black-soft",
                  )}
                />
              </span>
              <p className="text-xs font-medium leading-snug text-brand-black-soft lg:text-sm">{tSecondary(category.key)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LightingEditSection({ products, locale }: { products: Product[]; locale: string }) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  return (
    <section className="home-section-y bg-[#faf9f7]">
      <div className="container-home">
        <HomeSectionHeader
          title={t("lightingEditTitle")}
          subtitle={t("lightingEditSubtitle")}
          action={<HomeArrowLink href="/categories/indoor">{tCommon("viewAll")}</HomeArrowLink>}
        />
        <HomeProductGrid products={products} locale={locale} />
      </div>
    </section>
  );
}

export function ShopTheSceneSection() {
  const t = useTranslations("home");

  return (
    <section className="home-section-y-compact bg-[#080808] text-white">
      <div className="container-home">
        <div className="home-scene-split overflow-hidden home-clip-card lg:grid lg:grid-cols-2">
          <div className="relative min-h-[18rem] sm:min-h-[22rem] lg:min-h-[28rem]">
            <HomeImage
              entry={homeImages.scene}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <SceneHotspot className="absolute start-[18%] top-[22%] sm:start-[20%] sm:top-[26%]" />
            <SceneHotspot className="absolute end-[22%] top-[38%] sm:end-[26%] sm:top-[42%]" />
            <SceneHotspot className="absolute start-[42%] bottom-[32%] sm:start-[46%] sm:bottom-[36%]" />
            <SceneHotspot className="absolute end-[30%] bottom-[22%] sm:end-[34%] sm:bottom-[26%]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/50 rtl:lg:bg-gradient-to-l" aria-hidden="true" />
          </div>

          <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-14">
            <p className="home-eyebrow mb-3">{t("sceneEyebrow")}</p>
            <h2 className="home-heading-section max-w-lg text-white">{t("sceneTitle")}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/62 lg:mt-4 lg:text-base">{t("sceneSubtitle")}</p>
            <div className="mt-6 lg:mt-8">
              <HomeButtonInverse href="/scenes/majlis-classic">{t("sceneCta")}</HomeButtonInverse>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LightingExperienceSection() {
  const t = useTranslations("home");
  const [activeCct, setActiveCct] = useState<"3000" | "4000" | "6500">("3000");

  const steps = [
    { num: "01", label: t("experienceStep1") },
    { num: "02", label: t("experienceStep2") },
    { num: "03", label: t("experienceStep3") },
  ];

  const cctOptions = [
    { key: "3000" as const, label: t("cctWarm"), color: "#f5e6c8" },
    { key: "4000" as const, label: t("cctNeutral"), color: "#f0f0ec" },
    { key: "6500" as const, label: t("cctCool"), color: "#e8f0ff" },
  ];

  return (
    <section className="home-section-y-compact bg-[#f7f6f3] pb-mobile-nav lg:pb-14">
      <div className="container-home">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="max-w-lg">
            <p className="home-eyebrow mb-3">{t("experienceEyebrow")}</p>
            <h2 className="home-heading-section-lg text-brand-black-soft">{t("experienceTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary lg:mt-4 lg:text-base">{t("experienceSubtitle")}</p>

            <ol className="mt-8 space-y-4 lg:mt-10">
              {steps.map((step) => (
                <li key={step.num} className="flex items-start gap-4 border-b border-[#E0DFDD]/80 pb-4 last:border-0 last:pb-0">
                  <span className="font-mono text-sm font-semibold tracking-[0.08em] text-brand-orange">{step.num}</span>
                  <p className="text-sm leading-relaxed text-brand-black-soft lg:text-base">{step.label}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 lg:mt-0 lg:flex lg:flex-col lg:justify-center">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-text-secondary">{t("experienceCctLabel")}</p>
            <div className="flex flex-wrap gap-3">
              {cctOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setActiveCct(option.key)}
                  className={cn(
                    "inline-flex items-center gap-2.5 rounded-sm border px-4 py-2.5 text-sm transition-all duration-200",
                    activeCct === option.key
                      ? "border-brand-orange bg-white text-brand-black-soft shadow-sm"
                      : "border-[#E0DFDD] bg-white/70 text-text-secondary hover:border-brand-orange/30",
                  )}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-black/8"
                    style={{ backgroundColor: option.color }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs">{option.key}K</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 lg:mt-10">
              <HomeButtonAccent href="/lighting-experience">{t("experienceCta")}</HomeButtonAccent>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
