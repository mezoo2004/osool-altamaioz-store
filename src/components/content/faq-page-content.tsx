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

const FAQ_GROUPS = [
  { id: "general", titleKey: "catGeneral", keys: ["q1", "q2", "q3", "q4"] },
  { id: "selection", titleKey: "catSelection", keys: ["q5", "q6", "q7", "q8", "q9", "q10", "q11"] },
  { id: "technical", titleKey: "catTechnical", keys: ["q12", "q13", "q14", "q15", "q16"] },
  { id: "orders", titleKey: "catOrders", keys: ["q17", "q18", "q19", "q20"] },
  { id: "support", titleKey: "catSupport", keys: ["q21", "q22", "q23", "q24"] },
  { id: "policies", titleKey: "catPolicies", keys: ["q25", "q26", "q27"] },
] as const;

export function FaqPageContent({ locale }: { locale: string }) {
  const t = useTranslations("content.faq");
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";

  useEffect(() => {
    trackEvent("content_page_view", { page: "faq" });
  }, []);

  const groups = useMemo(
    () =>
      FAQ_GROUPS.map((group) => ({
        id: group.id,
        title: t(group.titleKey),
        items: group.keys.map((key) => ({
          id: key,
          question: t(`${key}Question`),
          answer: t(`${key}Answer`),
        })),
      })),
    [t],
  );

  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const jsonLd = buildFaqPageJsonLd(allItems);

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
        <div className="mx-auto max-w-3xl">
          <PendingConfirmationNotice locale={locale} />
          <p className="mb-8 text-sm leading-relaxed text-text-secondary md:text-base">{t("intro")}</p>
          <Accordion groups={groups} />
        </div>
      </ContentPageShell>
    </>
  );
}
