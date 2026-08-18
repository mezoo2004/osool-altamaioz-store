"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductGrid } from "@/components/catalog/product-card";
import { ExperienceBreadcrumb } from "@/components/experience/experience-breadcrumb";
import { ExperienceHero } from "@/components/content/content-page-shell";
import type { Product } from "@/lib/catalog/types";
import type { SceneRecord, SpaceRecord } from "@/lib/experience/types";
import { mainNavigation } from "@/lib/navigation-data";

type SpaceDetailContentProps = {
  space: SpaceRecord;
  relatedSpaces: SpaceRecord[];
  products: Product[];
  scenes: SceneRecord[];
  locale: string;
};

function categoryLabel(slug: string) {
  for (const item of mainNavigation) {
    if (item.slug === slug) return slug;
    const child = item.children?.find((c) => c.slug === slug);
    if (child) return child.key;
  }
  return slug;
}

export function SpaceDetailContent({
  space,
  relatedSpaces,
  products,
  scenes,
  locale,
}: SpaceDetailContentProps) {
  const t = useTranslations("experiences");
  const tNav = useTranslations("nav");
  const tSub = useTranslations("navSub");
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";
  const tips = locale === "ar" ? space.tipsAr : space.tipsEn;

  const getCatName = (slug: string) => {
    const key = categoryLabel(slug);
    for (const item of mainNavigation) {
      if (item.slug === slug) return tNav(item.key);
      const child = item.children?.find((c) => c.slug === slug);
      if (child) return tSub(child.key);
    }
    return key;
  };

  return (
    <div className="pb-16 md:pb-20">
      <ExperienceHero
        eyebrow={t("spacesEyebrow")}
        title={locale === "ar" ? space.nameAr : space.nameEn}
        subtitle={locale === "ar" ? space.shortDescriptionAr : space.shortDescriptionEn}
      />

      <div className="container-page section-y-sm">
        <ExperienceBreadcrumb
          items={[
            { label: brand, href: "/" },
            { label: t("spacesTitle"), href: "/spaces" },
            { label: locale === "ar" ? space.nameAr : space.nameEn },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-[1fr_18rem] lg:gap-14">
          <div className="space-y-4">
            <h2 className="heading-subsection">{t("aboutSpace")}</h2>
            <p className="max-w-2xl leading-relaxed text-text-secondary">
              {locale === "ar" ? space.descriptionAr : space.descriptionEn}
            </p>
          </div>
          <div className="card-surface h-fit p-5">
            <h3 className="font-semibold">{t("designYourLighting")}</h3>
            <p className="mt-2 text-meta">{t("experienceCtaHint")}</p>
            <Link
              href={`/lighting-experience?space=${space.slug}`}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-black-soft text-sm font-medium text-white transition-colors hover:bg-brand-black"
            >
              {t("designYourLighting")}
            </Link>
          </div>
        </div>

        <section className="mt-14 md:mt-16">
          <h2 className="heading-subsection mb-4">{t("recommendedCategories")}</h2>
          <div className="flex flex-wrap gap-2">
            {space.recommendedCategorySlugs.map((slug) => (
              <Link
                key={slug}
                href={`/categories/${slug}`}
                className="rounded-lg border border-border bg-white px-3.5 py-2 text-sm font-medium transition-colors hover:border-brand-black-soft"
              >
                {getCatName(slug)}
              </Link>
            ))}
          </div>
        </section>

        {products.length > 0 && (
          <section className="mt-14 md:mt-16">
            <h2 className="heading-subsection mb-6">{t("recommendedProducts")}</h2>
            <ProductGrid products={products} locale={locale} />
          </section>
        )}

        <section className="mt-14 md:mt-16">
          <h2 className="heading-subsection mb-4">{t("lightingGuidance")}</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {tips.map((tip) => (
              <li key={tip} className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {scenes.length > 0 && (
          <section className="mt-14 md:mt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="heading-subsection">{t("relatedScenes")}</h2>
              <Link href="/scenes" className="text-sm font-medium text-brand-orange hover:underline">
                {t("viewAllScenes")}
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {scenes.map((scene) => (
                <Link
                  key={scene.id}
                  href={`/scenes/${scene.slug}`}
                  className="group card-surface overflow-hidden transition-colors hover:border-brand-gray/50"
                >
                  <div
                    className="aspect-[16/10] bg-brand-black-soft transition-transform group-hover:scale-[1.01]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="p-5">
                    <h3 className="font-semibold">{locale === "ar" ? scene.nameAr : scene.nameEn}</h3>
                    <p className="mt-1 line-clamp-2 text-meta">{locale === "ar" ? scene.descriptionAr : scene.descriptionEn}</p>
                    <p className="mt-2 text-xs text-brand-orange">{scene.items.length} {t("productsInScene")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedSpaces.length > 0 && (
          <section className="mt-14 md:mt-16">
            <h2 className="heading-subsection mb-4">{t("relatedSpaces")}</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {relatedSpaces.map((s) => (
                <Link
                  key={s.id}
                  href={`/spaces/${s.slug}`}
                  className="card-surface p-4 text-sm font-medium transition-colors hover:border-brand-gray/50"
                >
                  {locale === "ar" ? s.nameAr : s.nameEn}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
