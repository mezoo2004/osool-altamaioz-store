"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { mainNavigation } from "@/lib/navigation-data";
import { storefrontMainNav } from "@/lib/navigation/storefront-nav";
import { cn } from "@/lib/utils";

type MegaMenuProps = {
  className?: string;
};

export function MegaMenu({ className }: MegaMenuProps) {
  const t = useTranslations("nav");
  const tSub = useTranslations("navSub");

  return (
    <nav className={cn("hidden lg:block", className)} aria-label="Main">
      <ul className="flex flex-wrap items-center gap-0.5">
        {storefrontMainNav.map((item) => {
          const isProducts = item.key === "products";

          return (
            <li key={item.key} className={cn(isProducts && "group relative")}>
              <Link href={item.href} className="nav-link">
                {t(item.key)}
              </Link>
              {isProducts ? (
                <div className="pointer-events-none absolute start-0 top-full z-50 min-w-[18rem] translate-y-1 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="mt-1 max-h-[min(24rem,70vh)] overflow-y-auto rounded-xl border border-border bg-white p-3 shadow-soft">
                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      {t("browseCategories")}
                    </p>
                    <ul className="grid gap-0.5">
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
                            className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                          >
                            {entry.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
