"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  label: string;
  className?: string;
};

export function LanguageSwitcher({ label, className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className={cn(
        "rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-text-secondary transition-colors hover:border-brand-black-soft hover:text-text-primary",
        className,
      )}
      aria-label={label}
    >
      {label}
    </button>
  );
}
