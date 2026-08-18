"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { brand } from "@/i18n/routing";

type HomeFooterProps = {
  locale: "ar" | "en";
};

const shopLinks = [
  { key: "indoor", href: "/categories/indoor" },
  { key: "outdoor", href: "/categories/outdoor" },
  { key: "offers", href: "/offers" },
  { key: "spaces", href: "/spaces" },
  { key: "scenes", href: "/scenes" },
] as const;

const serviceLinks = [
  { key: "experience", href: "/lighting-experience" },
  { key: "consult", href: "/lighting-experience" },
  { key: "projects", href: "/projects" },
] as const;

const infoLinks = [
  { key: "about", href: "/about" },
  { key: "faq", href: "/faq" },
  { key: "shipping", href: "/policies/shipping" },
  { key: "returns", href: "/policies/returns" },
  { key: "warranty", href: "/policies/warranty" },
] as const;

export function HomeFooter({ locale }: HomeFooterProps) {
  const t = useTranslations("homeFooter");
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");

  return (
    <footer className="bg-[#080808] text-white">
      <div className="container-home grid gap-10 py-14 md:grid-cols-2 md:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
        <div className="space-y-4 lg:col-span-4">
          <p className="text-xl font-semibold tracking-tight">{brand[locale]}</p>
          <p className="max-w-sm text-sm leading-relaxed text-white/58">{tFooter("tagline")}</p>
        </div>

        <FooterColumn
          className="lg:col-span-2"
          title={t("shop")}
          links={shopLinks}
          labelFn={(key) => tNav(key)}
        />
        <FooterColumn
          className="lg:col-span-2"
          title={t("services")}
          links={serviceLinks}
          labelFn={(key) => {
            if (key === "projects") return tNav("projects");
            return t(key);
          }}
        />
        <FooterColumn
          className="lg:col-span-2"
          title={t("info")}
          links={infoLinks}
          labelFn={(key) => {
            if (key === "faq" || key === "shipping" || key === "returns" || key === "warranty") {
              return tFooter(key);
            }
            return tNav(key);
          }}
        />

        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">{t("contact")}</h2>
          <ul className="space-y-3 text-sm text-white/58">
            <li>
              <Link href="/contact" className="group inline-flex items-center gap-2.5 transition-colors hover:text-white">
                <Phone className="h-4 w-4 text-brand-orange/80 transition-colors group-hover:text-brand-orange" strokeWidth={1.5} />
                {t("contactUs")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="group inline-flex items-center gap-2.5 transition-colors hover:text-white">
                <Mail className="h-4 w-4 text-brand-orange/80 transition-colors group-hover:text-brand-orange" strokeWidth={1.5} />
                {t("emailUs")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="group inline-flex items-center gap-2.5 transition-colors hover:text-white">
                <MapPin className="h-4 w-4 text-brand-orange/80 transition-colors group-hover:text-brand-orange" strokeWidth={1.5} />
                {t("location")}
              </Link>
            </li>
          </ul>
          <div className="flex gap-3 pt-1">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/12 text-white/55 transition-colors hover:border-brand-orange/40 hover:text-brand-orange"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="container-home flex flex-col gap-3 py-5 text-xs text-white/42 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand[locale]}. {tFooter("rights")}
          </p>
          <div className="flex flex-wrap gap-5">
            <Link href="/policies/privacy" className="transition-colors hover:text-white/75">
              {tFooter("privacy")}
            </Link>
            <Link href="/policies/terms" className="transition-colors hover:text-white/75">
              {tFooter("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function FooterColumn({
  title,
  links,
  labelFn,
  className,
}: {
  title: string;
  links: ReadonlyArray<{ key: string; href: string }>;
  labelFn: (key: string) => string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">{title}</h2>
      <ul className="space-y-2.5 text-sm text-white/58">
        {links.map((link) => (
          <li key={link.key}>
            <Link href={link.href} className="group inline-flex items-center gap-1.5 transition-colors hover:text-white">
              <span className="h-px w-0 bg-brand-orange transition-all duration-300 group-hover:w-3" aria-hidden="true" />
              {labelFn(link.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
