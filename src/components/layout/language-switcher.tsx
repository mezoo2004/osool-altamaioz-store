"use client";

import { Globe } from "lucide-react";
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
      className={cn("lang-switcher-premium", className)}
      aria-label={label}
    >
      <Globe className="h-3.5 w-3.5 opacity-70" strokeWidth={1.5} aria-hidden="true" />
      <span>{locale === "ar" ? "EN" : "AR"}</span>
    </button>
  );
}
