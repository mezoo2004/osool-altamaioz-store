"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { mainNavigation } from "@/lib/navigation-data";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
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
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <p className="text-sm font-semibold tracking-tight">{tCommon("menu")}</p>
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
            {mainNavigation.map((item) => (
              <li key={item.key}>
                <div className="flex items-center justify-between rounded-lg hover:bg-surface-muted">
                  <Link
                    href={item.href ?? `/categories/${item.slug}`}
                    onClick={onClose}
                    className="flex-1 px-3 py-3 text-sm font-medium"
                  >
                    {t(item.key)}
                  </Link>
                  {item.children && (
                    <button
                      type="button"
                      className="inline-flex h-11 min-w-11 items-center justify-center px-3 text-text-secondary"
                      aria-expanded={expanded === item.key}
                      onClick={() =>
                        setExpanded((current) => (current === item.key ? null : item.key))
                      }
                    >
                      {expanded === item.key ? "−" : "+"}
                    </button>
                  )}
                </div>
                {item.children && expanded === item.key && (
                  <ul className="mb-1 ms-3 border-s border-border ps-3">
                    {item.children.map((child) => (
                      <li key={child.key}>
                        <Link
                          href={`/categories/${child.slug}`}
                          onClick={onClose}
                          className="block rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                        >
                          {tSub(child.key)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/spaces"
                onClick={onClose}
                className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-surface-muted"
              >
                {t("spaces")}
              </Link>
            </li>
            <li>
              <Link
                href="/lighting-experience"
                onClick={onClose}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-brand-orange hover:bg-brand-orange/5"
              >
                {t("experience")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
