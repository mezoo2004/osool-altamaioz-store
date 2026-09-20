"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { OsoolLogo } from "@/components/brand/osool-logo";
import { mainNavigation } from "@/lib/navigation-data";
import { storefrontMainNav } from "@/lib/navigation/storefront-nav";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("nav");
  const tSub = useTranslations("navSub");
  const tCommon = useTranslations("common");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label={tCommon("close")}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-y-0 start-0 flex w-full max-w-[20rem] flex-col bg-white shadow-soft transition-transform duration-300 ease-out sm:w-[min(100%,20rem)]",
          visible ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5">
          <OsoolLogo locale={locale} tone="dark" presentation="full" size="headerCompact" href="/" onClick={onClose} />
          <p className="sr-only">{tCommon("menu")}</p>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn text-lg leading-none"
            aria-label={tCommon("close")}
          >
            ×
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile">
          <ul className="space-y-1">
            {storefrontMainNav.map((item) => {
              const isProducts = item.key === "products";
              return (
                <li key={item.key}>
                  <div className="flex items-center justify-between rounded-lg hover:bg-surface-muted">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex-1 px-3 py-3 text-sm font-medium",
                        isProducts && "text-brand-orange",
                      )}
                    >
                      {t(item.key)}
                    </Link>
                    {isProducts ? (
                      <button
                        type="button"
                        className="inline-flex h-11 min-w-11 items-center justify-center px-3 text-text-secondary"
                        aria-expanded={expanded === "categories"}
                        onClick={() =>
                          setExpanded((current) => (current === "categories" ? null : "categories"))
                        }
                      >
                        {expanded === "categories" ? "−" : "+"}
                      </button>
                    ) : null}
                  </div>
                  {isProducts && expanded === "categories" ? (
                    <ul className="mb-1 ms-3 max-h-48 overflow-y-auto border-s border-border ps-3">
                      {mainNavigation.flatMap((navItem) => [
                        { key: navItem.key, slug: navItem.slug, label: t(navItem.key) },
                        ...(navItem.children?.map((child) => ({
                          key: child.key,
                          slug: child.slug,
                          label: tSub(child.key),
                        })) ?? []),
                      ]).map((entry) => (
                        <li key={`${entry.key}-${entry.slug}`}>
                          <Link
                            href={`/categories/${entry.slug}`}
                            onClick={onClose}
                            className="block rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                          >
                            {entry.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
