"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { mainNavigation } from "@/lib/navigation-data";
import { cn } from "@/lib/utils";

type MegaMenuProps = {
  className?: string;
};

export function MegaMenu({ className }: MegaMenuProps) {
  const t = useTranslations("nav");
  const tSub = useTranslations("navSub");

  return (
    <nav className={cn("hidden lg:block", className)} aria-label="Main">
      <ul className="flex items-center gap-0.5">
        {mainNavigation.map((item) => (
          <li key={item.key} className="group relative">
            <Link
              href={item.href ?? `/categories/${item.slug}`}
              className="nav-link"
            >
              {t(item.key)}
            </Link>
            {item.children && item.children.length > 0 && (
              <div className="pointer-events-none absolute start-0 top-full z-50 min-w-[16rem] translate-y-1 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="mt-1 rounded-xl border border-border bg-white p-3 shadow-soft">
                  <ul className="grid gap-0.5">
                    {item.children.map((child) => (
                      <li key={child.key}>
                        <Link
                          href={`/categories/${child.slug}`}
                          className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                        >
                          {tSub(child.key)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </li>
        ))}
        <li>
          <Link href="/spaces" className="nav-link">
            {t("spaces")}
          </Link>
        </li>
        <li>
          <Link
            href="/lighting-experience"
            className="nav-link text-brand-orange hover:text-brand-orange"
          >
            {t("experience")}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
