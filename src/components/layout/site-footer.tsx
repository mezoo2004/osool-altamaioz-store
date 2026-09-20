"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { OsoolLogo } from "@/components/brand/osool-logo";
import { brand } from "@/i18n/routing";
import { footerLinks } from "@/lib/navigation-data";

type SiteFooterProps = {
  locale: "ar" | "en";
};

export function SiteFooter({ locale }: SiteFooterProps) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t border-border bg-brand-black-soft text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 md:py-16 lg:grid-cols-4 lg:gap-12">
        <div className="space-y-4 lg:col-span-1">
          <OsoolLogo locale={locale} surface="dark" size="footer" href="/" />
          <p className="max-w-xs text-sm leading-relaxed text-white/65">{t("tagline")}</p>
        </div>

        <FooterColumn title={t("shop")} links={footerLinks.shop} labelFn={(key) => tNav(key)} />
        <FooterColumn title={t("support")} links={footerLinks.support} labelFn={(key) => t(key)} />
        <FooterColumn
          title={t("company")}
          links={footerLinks.company}
          labelFn={(key) => {
            if (key === "privacy" || key === "terms") return t(key);
            return tNav(key);
          }}
        />
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand[locale]}. {t("rights")}
          </p>
          <div className="flex flex-wrap gap-5">
            <Link href="/policies/privacy" className="transition-colors hover:text-white">
              {t("privacy")}
            </Link>
            <Link href="/policies/terms" className="transition-colors hover:text-white">
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  labelFn,
}: {
  title: string;
  links: ReadonlyArray<{ key: string; href: string }>;
  labelFn: (key: string) => string;
}) {
  return (
    <div>
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">{title}</h2>
      <ul className="space-y-2.5 text-sm text-white/60">
        {links.map((link) => (
          <li key={link.key}>
            <Link href={link.href} className="transition-colors hover:text-white">
              {labelFn(link.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
