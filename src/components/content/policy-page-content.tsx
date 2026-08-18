"use client";

import { useEffect } from "react";
import {
  ContentPageShell,
  PendingConfirmationNotice,
} from "@/components/content/content-page-shell";
import type { PolicyDefinition } from "@/lib/content/policies";
import { trackEvent } from "@/lib/analytics";

export function PolicyPageContent({
  locale,
  policy,
}: {
  locale: string;
  policy: PolicyDefinition;
}) {
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";
  const title = locale === "ar" ? policy.titleAr.replace(/ \|.*$/, "") : policy.titleEn.replace(/ \|.*$/, "");

  useEffect(() => {
    trackEvent("content_page_view", { page: `policy_${policy.slug}` });
  }, [policy.slug]);

  return (
    <ContentPageShell
      breadcrumb={[
        { label: brand, href: "/" },
        { label: title },
      ]}
      hero={{
        eyebrow: locale === "ar" ? "سياسات المتجر" : "Store policies",
        title,
        subtitle: locale === "ar" ? policy.descriptionAr : policy.descriptionEn,
      }}
    >
      <div className="mx-auto max-w-3xl">
        <PendingConfirmationNotice locale={locale} />

        {policy.sections.length > 1 && (
          <nav className="mb-8 rounded-lg border border-border bg-surface-muted p-4" aria-label="Table of contents">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
              {locale === "ar" ? "محتويات" : "Contents"}
            </p>
            <ol className="space-y-1.5 text-sm">
              {policy.sections.map((section, i) => (
                <li key={section.headingEn}>
                  <a href={`#section-${i}`} className="text-text-secondary transition-colors hover:text-brand-black-soft">
                    {locale === "ar" ? section.headingAr : section.headingEn}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <article className="space-y-10">
          {policy.sections.map((section, i) => (
            <section
              key={section.headingEn}
              id={`section-${i}`}
              className="scroll-mt-24 border-b border-border pb-8 last:border-0"
            >
              <h2 className="heading-subsection mb-3">
                {locale === "ar" ? section.headingAr : section.headingEn}
              </h2>
              <p className="text-sm leading-relaxed text-text-secondary md:text-base">
                {locale === "ar" ? section.bodyAr : section.bodyEn}
              </p>
            </section>
          ))}
        </article>
      </div>
    </ContentPageShell>
  );
}
