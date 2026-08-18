"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExperienceBreadcrumb } from "@/components/experience/experience-breadcrumb";
import { ExperienceHero } from "@/components/content/content-page-shell";
import { trackEvent } from "@/lib/analytics";
import type { SpaceRecord } from "@/lib/experience/types";

export function SpacesIndexContent({ spaces, locale }: { spaces: SpaceRecord[]; locale: string }) {
  const t = useTranslations("experiences");
  const tCommon = useTranslations("common");
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";

  useEffect(() => {
    trackEvent("shop_by_space_view");
  }, []);

  return (
    <div className="pb-16 md:pb-20">
      <ExperienceHero
        eyebrow={t("spacesEyebrow")}
        title={t("spacesHeroTitle")}
        subtitle={t("spacesHeroSubtitle")}
        cta={{ label: t("designYourLighting"), href: "/lighting-experience" }}
      />

      <div className="container-page section-y-sm">
        <ExperienceBreadcrumb
          items={[
            { label: brand, href: "/" },
            { label: t("spacesTitle") },
          ]}
        />

        <div className="mb-10 max-w-2xl">
          <h2 className="heading-section">{t("spacesGridTitle")}</h2>
          <p className="mt-2 text-meta">{t("spacesGridSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/spaces/${space.slug}`}
              onClick={() => trackEvent("space_select", { space_slug: space.slug })}
              className="group card-surface overflow-hidden transition-colors hover:border-brand-gray/50"
            >
              <div
                className="aspect-[16/10] bg-surface-muted transition-transform duration-300 group-hover:scale-[1.01]"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(8,8,8,0.04) 0%, rgba(8,8,8,0.35) 100%), linear-gradient(135deg, #E0DFDD, #6D6F72)",
                }}
              />
              <div className="space-y-2 p-5">
                <h3 className="text-lg font-semibold">{locale === "ar" ? space.nameAr : space.nameEn}</h3>
                <p className="line-clamp-2 text-meta">{locale === "ar" ? space.shortDescriptionAr : space.shortDescriptionEn}</p>
                <span className="inline-flex text-sm font-medium text-brand-orange">
                  {tCommon("learnMore")} {locale === "ar" ? "←" : "→"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
