"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ContentPageShell,
  ContentSection,
  PendingConfirmationNotice,
} from "@/components/content/content-page-shell";
import { trackEvent } from "@/lib/analytics";

export function AboutPageContent({ locale }: { locale: string }) {
  const t = useTranslations("content.about");
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";

  useEffect(() => {
    trackEvent("content_page_view", { page: "about" });
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
        cta: { label: t("cta"), href: "/categories/indoor" },
      }}
    >
      <div className="mx-auto max-w-3xl">
        <PendingConfirmationNotice locale={locale} />

        <ContentSection title={t("missionTitle")}>
          <p>{t("missionBody")}</p>
        </ContentSection>

        <ContentSection title={t("offerTitle")}>
          <ul className="list-disc space-y-2 ps-5">
            <li>{t("offer1")}</li>
            <li>{t("offer2")}</li>
            <li>{t("offer3")}</li>
            <li>{t("offer4")}</li>
          </ul>
        </ContentSection>

        <ContentSection title={t("experienceTitle")}>
          <p>{t("experienceBody")}</p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/spaces" className="text-sm font-medium text-brand-orange hover:underline">
              {t("spacesLink")} {locale === "ar" ? "←" : "→"}
            </Link>
            <Link href="/scenes" className="text-sm font-medium text-brand-orange hover:underline">
              {t("scenesLink")} {locale === "ar" ? "←" : "→"}
            </Link>
            <Link href="/lighting-experience" className="text-sm font-medium text-brand-orange hover:underline">
              {t("experienceLink")} {locale === "ar" ? "←" : "→"}
            </Link>
          </div>
        </ContentSection>
      </div>
    </ContentPageShell>
  );
}
