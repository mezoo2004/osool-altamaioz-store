"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExperienceBreadcrumb } from "@/components/experience/experience-breadcrumb";
import { ExperienceHero } from "@/components/content/content-page-shell";
import { trackEvent } from "@/lib/analytics";
import type { SceneRecord, SpaceRecord } from "@/lib/experience/types";
import { cn } from "@/lib/utils";

type ScenesIndexContentProps = {
  scenes: SceneRecord[];
  spaces: SpaceRecord[];
  locale: string;
  initialSpaceFilter?: string;
};

export function ScenesIndexContent({
  scenes,
  spaces,
  locale,
  initialSpaceFilter,
}: ScenesIndexContentProps) {
  const t = useTranslations("experiences");
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";

  useEffect(() => {
    trackEvent("shop_scene_view");
  }, []);

  const spaceMap = Object.fromEntries(spaces.map((s) => [s.id, s]));

  return (
    <div className="pb-16 md:pb-20">
      <ExperienceHero
        eyebrow={t("scenesEyebrow")}
        title={t("scenesHeroTitle")}
        subtitle={t("scenesHeroSubtitle")}
      />

      <div className="container-page section-y-sm">
        <ExperienceBreadcrumb
          items={[
            { label: brand, href: "/" },
            { label: t("scenesTitle") },
          ]}
        />

        {spaces.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <FilterPill href="/scenes" active={!initialSpaceFilter} label={t("allSpaces")} />
            {spaces.map((space) => (
              <FilterPill
                key={space.id}
                href={`/scenes?space=${space.slug}`}
                active={initialSpaceFilter === space.slug}
                label={locale === "ar" ? space.nameAr : space.nameEn}
              />
            ))}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {scenes.map((scene) => {
            const space = spaceMap[scene.spaceId];
            return (
              <Link
                key={scene.id}
                href={`/scenes/${scene.slug}`}
                className="group card-surface overflow-hidden transition-colors hover:border-brand-gray/50"
              >
                <div className="relative aspect-[4/3] bg-brand-black-soft">
                  <div
                    className="absolute inset-0 opacity-30"
                    aria-hidden="true"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                      backgroundSize: "32px 32px",
                    }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(8,8,8,0.75))]" />
                  <div className="absolute bottom-4 start-4 end-4 flex items-end justify-between gap-3 text-white">
                    <div>
                      {space && (
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-brand-orange">
                          {locale === "ar" ? space.nameAr : space.nameEn}
                        </p>
                      )}
                      <h2 className="text-lg font-semibold md:text-xl">
                        {locale === "ar" ? scene.nameAr : scene.nameEn}
                      </h2>
                    </div>
                    <span className="shrink-0 rounded-md bg-white/10 px-2.5 py-1 text-xs backdrop-blur">
                      {scene.items.length} {t("productsInScene")}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="line-clamp-2 text-meta">{locale === "ar" ? scene.descriptionAr : scene.descriptionEn}</p>
                  <span className="mt-3 inline-flex text-sm font-medium text-brand-orange">
                    {t("viewScene")} {locale === "ar" ? "←" : "→"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-brand-black-soft text-white"
          : "border border-border bg-white text-text-secondary hover:border-brand-gray",
      )}
    >
      {label}
    </Link>
  );
}
