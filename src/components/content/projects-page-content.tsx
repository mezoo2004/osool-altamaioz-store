"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  ContentPageShell,
  ContentSection,
  PendingConfirmationNotice,
} from "@/components/content/content-page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProjectsData } from "@/lib/content/projects";
import { trackEvent } from "@/lib/analytics";

export function ProjectsPageContent({
  locale,
  data,
}: {
  locale: string;
  data: ProjectsData;
}) {
  const t = useTranslations("content.projects");
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";

  useEffect(() => {
    trackEvent("content_page_view", { page: "projects" });
  }, []);

  return (
    <ContentPageShell
      breadcrumb={[
        { label: brand, href: "/" },
        { label: t("title") },
      ]}
      hero={{
        eyebrow: t("eyebrow"),
        title: t("heroTitle"),
        subtitle: t("heroSubtitle"),
      }}
    >
      <PendingConfirmationNotice locale={locale} />

      <ContentSection title={t("architectureTitle")}>
        <p>{t("architectureBody")}</p>
      </ContentSection>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {data.categories.map((cat) => (
          <div key={cat.id} className="card-surface p-5">
            <h3 className="font-semibold">{locale === "ar" ? cat.nameAr : cat.nameEn}</h3>
            <p className="mt-2 text-meta">{locale === "ar" ? cat.descriptionAr : cat.descriptionEn}</p>
          </div>
        ))}
      </div>

      {data.projects.length === 0 ? (
        <EmptyState title={t("emptyState")} description={data.note} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.projects.map((project) => (
            <article key={project.id} className="card-surface overflow-hidden">
              <div
                className="aspect-[16/10] bg-surface-muted"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(8,8,8,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(8,8,8,0.03) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="p-5">
                <h3 className="font-semibold">{locale === "ar" ? project.titleAr : project.titleEn}</h3>
                <p className="mt-2 text-meta">{locale === "ar" ? project.summaryAr : project.summaryEn}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </ContentPageShell>
  );
}
