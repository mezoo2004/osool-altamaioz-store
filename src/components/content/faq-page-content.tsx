"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ContentPageShell,
  PendingConfirmationNotice,
} from "@/components/content/content-page-shell";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { buildFaqPageJsonLd } from "@/lib/seo/structured-data";
import { trackEvent } from "@/lib/analytics";

export function FaqPageContent({ locale }: { locale: string }) {
  const t = useTranslations("content.faq");
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";

  useEffect(() => {
    trackEvent("content_page_view", { page: "faq" });
  }, []);

  const items = useMemo(
    () =>
      ["q1", "q2", "q3", "q4", "q5", "q6"].map((key) => ({
        id: key,
        question: t(`${key}Question`),
        answer: t(`${key}Answer`),
      })),
    [t],
  );

  const jsonLd = buildFaqPageJsonLd(items);

  return (
    <>
      <JsonLd data={jsonLd} />
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
        <Accordion items={items} />
      </ContentPageShell>
    </>
  );
}
