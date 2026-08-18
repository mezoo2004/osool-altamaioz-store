"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ContentPageShell,
  ContentSection,
  PendingConfirmationNotice,
} from "@/components/content/content-page-shell";
import { trackEvent } from "@/lib/analytics";

export function ContactPageContent({ locale }: { locale: string }) {
  const t = useTranslations("content.contact");
  const brand = locale === "ar" ? "اصول التميز" : "Osool Altamaioz";
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    trackEvent("content_page_view", { page: "contact" });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("contact_form_submit");
    setSubmitted(true);
  };

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

      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
        <ContentSection title={t("channelsTitle")}>
          <p>{t("channelsBody")}</p>
          <ul className="space-y-3 pt-2">
            <li className="border-s-2 border-brand-orange/40 ps-3">{t("emailPending")}</li>
            <li className="border-s-2 border-brand-orange/40 ps-3">{t("phonePending")}</li>
            <li className="border-s-2 border-brand-orange/40 ps-3">{t("addressPending")}</li>
          </ul>
        </ContentSection>

        <div className="card-surface p-5 md:p-6">
          <h2 className="heading-subsection mb-5">{t("formTitle")}</h2>
          {submitted ? (
            <p className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm text-text-secondary">
              {t("formSuccess")}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label={t("name")} name="name" required />
              <Field label={t("email")} name="email" type="email" required />
              <Field label={t("phone")} name="phone" type="tel" />
              <div>
                <label htmlFor="message" className="mb-1.5 block text-meta">
                  {t("message")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="input-field resize-y py-2.5"
                />
              </div>
              <button type="submit" className="btn-cta w-full sm:w-auto">
                {t("submit")}
              </button>
              <p className="text-meta">{t("formNote")}</p>
            </form>
          )}
        </div>
      </div>
    </ContentPageShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-meta">
        {label}
      </label>
      <input id={name} name={name} type={type} required={required} className="input-field" />
    </div>
  );
}
