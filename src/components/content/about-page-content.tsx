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

const VALUE_KEYS = ["value1", "value2", "value3", "value4"] as const;
const OFFER_KEYS = ["offer1", "offer2", "offer3", "offer4", "offer5", "offer6"] as const;
const AUDIENCE_KEYS = ["audience1", "audience2", "audience3", "audience4", "audience5", "audience6"] as const;

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
      <div className="mx-auto max-w-4xl">
        <PendingConfirmationNotice locale={locale} />

        <ContentSection title={t("introTitle")}>
          <p className="text-base leading-relaxed text-text-primary md:text-lg">{t("introBody")}</p>
        </ContentSection>

        <section className="mb-12 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface-muted/50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">{t("missionLabel")}</p>
            <h2 className="heading-subsection mt-2 text-xl">{t("missionTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary md:text-base">{t("missionBody")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-brand-black-soft p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">{t("visionLabel")}</p>
            <h2 className="mt-2 text-xl font-semibold">{t("visionTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">{t("visionBody")}</p>
          </div>
        </section>

        <ContentSection title={t("offerTitle")}>
          <p className="mb-5">{t("offerIntro")}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {OFFER_KEYS.map((key) => (
              <li
                key={key}
                className="flex gap-3 rounded-xl border border-border/80 bg-white px-4 py-3.5 text-sm leading-relaxed text-text-secondary"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" aria-hidden="true" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection title={t("whyTitle")}>
          <p className="mb-5">{t("whyIntro")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUE_KEYS.map((key) => (
              <div key={key} className="rounded-xl border border-border bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-brand-black-soft md:text-base">{t(`${key}Title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{t(`${key}Body`)}</p>
              </div>
            ))}
          </div>
        </ContentSection>

        <section className="mb-12 rounded-2xl border border-brand-orange/20 bg-brand-orange/[0.04] p-6 md:p-8">
          <h2 className="heading-subsection mb-3">{t("reachTitle")}</h2>
          <p className="text-sm leading-relaxed text-text-secondary md:text-base">{t("reachBody")}</p>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-brand-black-soft md:text-3xl">
            {t("reachHighlight")}
          </p>
        </section>

        <ContentSection title={t("audienceTitle")}>
          <p className="mb-4">{t("audienceIntro")}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {AUDIENCE_KEYS.map((key) => (
              <li key={key} className="rounded-lg bg-surface-muted/60 px-4 py-3 text-sm text-text-secondary">
                {t(key)}
              </li>
            ))}
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
            <Link href="/contact" className="text-sm font-medium text-brand-orange hover:underline">
              {t("contactLink")} {locale === "ar" ? "←" : "→"}
            </Link>
          </div>
        </ContentSection>

        <section className="rounded-2xl border border-border bg-brand-black-soft px-6 py-8 text-center text-white md:px-10 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">{brand}</p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            {t("closingStatement")}
          </p>
        </section>
      </div>
    </ContentPageShell>
  );
}
